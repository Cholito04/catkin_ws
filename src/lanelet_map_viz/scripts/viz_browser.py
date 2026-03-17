#!/usr/bin/env python3

import os
import rospy
import json
import threading
import socket

from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import TCPServer

import lanelet2
from lanelet2.projection import UtmProjector

from geometry_msgs.msg import Point, PoseStamped
from tf.transformations import euler_from_quaternion

import webbrowser
import math
import utm

#global variables to store data
vehicle_pose = None
map_data = None
data_lock = threading.Lock()
stops_data = {}

STOPS = {
    "Bus Loop": [42.284244, -85.617362],
    "Western Village Apartments": [42.276701, -85.639541],
    "College of Business": [42.285637, -85.618405],
    "Stadium Drive Apartments": [42.270157, -85.642321],
    "Miller Auditorium": [42.279227, -85.616093],
    "Waldo Library": [42.281617, -85.614032],
    "College of Health and Human Services": [42.281557, -85.603237],
    "Recreation Center": [42.284526, -85.607515],
    "Western Heights": [42.286766, -85.612461],
    "Valley 1 Britton/Hadley": [42.289575, -85.614581],
    "Valley 1 Ackley/Shilling": [42.290789, -85.615011],
    "Valley 2 Eicher/Lefevre": [42.290261, -85.617203],
    "Valley 2 Harvey/Garneau": [42.291546, -85.617662],
    "Valley Dining Center": [42.288321, -85.617481],
    "Dunbar Hall": [42.280416, -85.614328],
    "Student Center": [42.282573, -85.612500],
    "Ellsworth Hall": [42.285276, -85.610362],
    "Sangren Hall": [42.284463, -85.614872]
}

ORIGIN_LAT  = 41.54938912945
ORIGIN_LON  = -85.79313557283
ORIGIN_LOCAL_X = 13620.5907   # from the osm file node id=2
ORIGIN_LOCAL_Y = 81570.5428
def build_stops(llmap, projector):
    stops = {}
    # get UTM of origin once
    ox_utm, oy_utm, zone, band = utm.from_latlon(ORIGIN_LAT, ORIGIN_LON)

    for name, (lat, lon) in STOPS.items():
        px_utm, py_utm, _, _ = utm.from_latlon(lat, lon, zone, band)
        
        # delta from origin in UTM space, then shift into local space
        x = (px_utm - ox_utm) - ORIGIN_LOCAL_X
        y = (py_utm - oy_utm) - ORIGIN_LOCAL_Y

        lanelet_id, centerline_point = find_nearest_lanelet(x, y, llmap)
        stops[name] = {
            "display_name": name,
            "x": x, "y": y,
            "lanelet_id": lanelet_id,
            "centerline_point": centerline_point
        }
    return stops

class DataHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, directory=None, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def do_GET(self):
        if self.path == '/data':
            with data_lock:
                data = {
                    'map': map_data,
                    'vehicle': vehicle_pose
                }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(data).encode())
        elif self.path == '/stops':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(stops_data).encode())    
        else:
            super().do_GET()
    def do_POST(self):
        #add routing logic here
        if self.path == '/route':
            content_length = int(self.headers['Content-Length'])
            body = json.loads(self.rfile.read(content_length))
            
            start_stop = stops_data[body["start"]]
            goal_stop = stops_data[body["goal"]]
            

            start_ll = get_lanelet_by_id(llmap_global, start_stop["lanelet_id"])
            goal_ll  = get_lanelet_by_id(llmap_global, goal_stop["lanelet_id"])

            route_pts = None
            if start_ll is not None and goal_ll is not None:
                route_pts = compute_centerline_route_points(start_ll, goal_ll)

            # fallback: straight line if routing fails
            if not route_pts:
                route_pts = [start_stop["centerline_point"], goal_stop["centerline_point"]]

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"waypoints": route_pts}).encode())
        else:
            super().do_POST()

def find_free_port():
    """Find a free port to run the HTTP server on"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]


def pose_callback(msg):
    global vehicle_pose

    pose = msg.pose.pose

    q = msg.pose.orientation
    yaw = euler_from_quaternion([q.x, q.y, q.z, q.w])[2]

    with data_lock:
        vehicle_pose = {
            "x": msg.pose.position.x,
            "y": msg.pose.position.y,
            "yaw": yaw
        }


def load_lanelet_map(map_path):
    origin = lanelet2.io.Origin(41.54938912945, -85.79313557283)
    projector = UtmProjector(origin)

    llmap = lanelet2.io.load(map_path, projector)

    lanelets_json = []

    for ll in llmap.laneletLayer:
        lanelets_json.append({
            "left": [[p.x, p.y] for p in ll.leftBound],
            "right": [[p.x, p.y] for p in ll.rightBound],
            "center": [[p.x, p.y] for p in ll.centerline]
        })
    
    return llmap, lanelets_json, projector

def find_nearest_lanelet(x, y, llmap):
    best_lanelet_id = None
    best_point = None
    best_dist = float('inf')

    for ll in llmap.laneletLayer:
        for p in ll.centerline:
            dist = math.sqrt((p.x - x)**2 + (p.y - y)**2)
            if dist < best_dist:
                best_dist = dist
                best_lanelet_id = ll.id
                best_point = [p.x, p.y]

    return best_lanelet_id, best_point


def create_html_file(port):
    html_path = os.path.join(os.path.dirname(__file__), "../web/visualization.html")
    with open(html_path, "r") as f:
        html_content = f.read()

    # Replace placeholder with actual port
    html_content = html_content.replace("${PORT}", str(port))

    temp_path = os.path.join(os.path.dirname(__file__), "../web/temp.html")
    with open(temp_path, "w") as f:
        f.write(html_content)

    print(f"Created visualization HTML file: {temp_path}")

def debug_map_bounds(llmap):
    xs = []
    ys = []
    for ll in llmap.laneletLayer:
        for p in ll.centerline:
            xs.append(p.x)
            ys.append(p.y)
    rospy.loginfo(f"Map X range: {min(xs):.1f} to {max(xs):.1f}")
    rospy.loginfo(f"Map Y range: {min(ys):.1f} to {max(ys):.1f}")
    rospy.loginfo(f"Map center: {sum(xs)/len(xs):.1f}, {sum(ys)/len(ys):.1f}")

def main():
    global map_data
    global stops_data

    try:
        rospy.init_node("lanelet_web_viz")
    except rospy.exceptions.ROSInitException:
        print("Ros master is not running. Please start roscore first.")
        return
    map_path = rospy.get_param("~map_file")
    if not os.path.exists(map_path):
        rospy.logerr("Map file not found")
        return 
    
    # initalize Ros node 
    rospy.loginfo("Initializing visualization node...")
    
    rospy.loginfo("Setting up subscribers...")
    llmap, lanelets_json, projector = load_lanelet_map(map_path)
    map_data = lanelets_json
    debug_map_bounds(llmap)
    rospy.loginfo(f"Loaded {len(map_data)} lanelets")
    stops_data = build_stops(llmap, projector)
    rospy.Subscriber("/vehicle_pose", PoseStamped, pose_callback)

    port = find_free_port()
    
    # open HTML viz file
    create_html_file(port)

    # Change to the directory where the script is located
    os.chdir(os.path.join(os.path.dirname(__file__), "../web"))
    
    # start HTTP server
    server_address = ('localhost', port)
    httpd = HTTPServer(server_address, DataHandler)

    rospy.loginfo(f"Starting web server at http://localhost:{port}")

    # Open the visualization in the default browser
    webbrowser.open(f"http://localhost:{port}/temp.html")
      

    # Start server in a separate thread
    server_thread = threading.Thread(target=httpd.serve_forever)
    server_thread.daemon = True
    server_thread.start()

    rospy.loginfo("Visualization node initialization complete")
    
    # Keep the main thread alive for ROS callbacks
    try:
        rospy.spin()
    except KeyboardInterrupt:
        rospy.loginfo("Shutting down...")
    finally:
        httpd.shutdown()
        rospy.loginfo("Web server stopped")

if __name__ == "__main__":
    main()
