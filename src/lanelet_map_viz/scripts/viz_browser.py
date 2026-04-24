#!/usr/bin/env python3

import os
import rospy
import json
import threading
import socket
import open3d as o3d

from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import TCPServer

import lanelet2
from lanelet2.projection import UtmProjector

from geometry_msgs.msg import Pose2D
from visualization_msgs.msg import MarkerArray

import webbrowser
import math
import utm

#global variables to store data
vehicle_pose = None
map_data = None
routing_graph = None
traffic_rules = None
llmap_global = None
data_lock = threading.Lock()
stops_data = {}
predicted_objects = []
tracked_objects = []
pcd_data = None

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
ORIGIN_LOCAL_X = 13620.5907 + 50   # from the osm file node id=2
ORIGIN_LOCAL_Y = 81570.5428 + 900  



def build_stops(llmap, projector):
    stops = {}
    # get UTM of origin once
    ox_utm, oy_utm, zone, band = utm.from_latlon(ORIGIN_LAT, ORIGIN_LON)

    for name, (lat, lon) in STOPS.items():
        px_utm, py_utm, _, _ = utm.from_latlon(lat, lon, zone, band)
        
        # delta from origin in UTM space, then shift into local space
        x = (px_utm - ox_utm) - ORIGIN_LOCAL_X
        y = (py_utm - oy_utm) - ORIGIN_LOCAL_Y

        candidates = find_k_nearest_lanelets(x, y, llmap, k=3)

        stops[name] = {
            "display_name": name,
            "x": x, "y": y,
            "lanelet_candidates": candidates
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
                    'vehicle': vehicle_pose,
                    'predicted_objects': predicted_objects,
                    'tracked_objects': tracked_objects,
                    'pointcloud': pcd_data 
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
            goal_stop  = stops_data[body["goal"]]

            best_route = None
            best_length = float('inf')

            start_candidates = start_stop["lanelet_candidates"]
            goal_candidates  = goal_stop["lanelet_candidates"]

            for sid, _ in start_candidates:
                for gid, _ in goal_candidates:
                    start_ll = get_lanelet_by_id(llmap_global, sid)
                    goal_ll  = get_lanelet_by_id(llmap_global, gid)

                    route = compute_centerline_route_points(start_ll, goal_ll)

                    if route:
                        length = sum(
                            math.hypot(route[i][0] - route[i-1][0],
                                    route[i][1] - route[i-1][1])
                            for i in range(1, len(route))
                        )

                        if length < best_length:
                            best_length = length
                            best_route = route

            route_pts = best_route
            # prepend current vehicle position so route starts from the van
            with data_lock:
                current_pose = vehicle_pose

            if current_pose:
                vx, vy = current_pose["x"], current_pose["y"]

                vehicle_candidates = find_k_nearest_lanelets(vx, vy, llmap_global, k=3)

                best_vehicle_route = None
                best_len = float('inf')

                for vid, _ in vehicle_candidates:
                    for gid, _ in goal_stop["lanelet_candidates"]:
                        start_ll = get_lanelet_by_id(llmap_global, vid)
                        goal_ll  = get_lanelet_by_id(llmap_global, gid)

                        route = compute_centerline_route_points(start_ll, goal_ll)

                        if route:
                            length = sum(
                                math.hypot(route[i][0] - route[i-1][0],
                                        route[i][1] - route[i-1][1])
                                for i in range(1, len(route))
                            )

                            if length < best_len:
                                best_len = length
                                best_vehicle_route = route

                if best_vehicle_route:
                    route_pts = best_vehicle_route
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
    with data_lock:
        vehicle_pose = {
            "x": msg.x,
            "y": msg.y,
            "yaw": msg.theta
        }


# kinematics callbacks
def predicted_callback(msg):
    global predicted_objects, vehicle_pose
    with data_lock:
        vx = vehicle_pose["x"] if vehicle_pose else 0
        vy = vehicle_pose["y"] if vehicle_pose else 0
        predicted_objects = [
            {
                "x": m.pose.position.x + vx,
                "y": m.pose.position.y + vy
            }
            for m in msg.markers
        ]


def tracked_callback(msg):
    global tracked_objects, vehicle_pose
    with data_lock:
        vx = vehicle_pose["x"] if vehicle_pose else 0
        vy = vehicle_pose["y"] if vehicle_pose else 0
        tracked_objects = [
            {
                "x": m.pose.position.x + vx,
                "y": m.pose.position.y + vy
            }
            for m in msg.markers
        ]
        
 #point cloud data
def load_pcd_file(pcd_path):
    pcd = o3d.io.read_point_cloud(pcd_path)
    points = list(map(lambda p: [p[0], p[1], p[2]], pcd.points))
    return points


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
    
def get_lanelet_by_id(llmap, lanelet_id):
    # laneletLayer in python behaves like a container; this works in many builds
    for ll in llmap.laneletLayer:
        if ll.id == lanelet_id:
            return ll
    return None

def extract_lanelets_from_path(path_obj):
    # Different lanelet2 python builds expose lanelets differently
    for attr in ["lanelets", "getLanelets", "laneletSequence", "lanelet_sequence"]:
        if hasattr(path_obj, attr):
            try:
                return getattr(path_obj, attr)()
            except TypeError:
                return getattr(path_obj, attr)
            except Exception:
                pass
    try:
        return list(path_obj)
    except Exception:
        return None

def compute_centerline_route_points(start_lanelet, goal_lanelet):
    global routing_graph
    if routing_graph is None:
        return None

    # try common method names
    path = None
    for fn in ["shortestPath", "shortest_path"]:
        if hasattr(routing_graph, fn):
            try:
                path = getattr(routing_graph, fn)(start_lanelet, goal_lanelet)
                break
            except Exception:
                pass

    if path is None:
        return None

    lanelets = extract_lanelets_from_path(path)
    if not lanelets:
        return None

    pts = []
    for ll in lanelets:
        # centerline points are lanelet2 points with .x and .y
        for p in ll.centerline:
            pts.append([float(p.x), float(p.y)])

    # de-duplicate consecutive identical points
    filtered = []
    for xy in pts:
        if not filtered or xy != filtered[-1]:
            filtered.append(xy)

    return filtered if len(filtered) >= 2 else None


def find_k_nearest_lanelets(x, y, llmap, k=3):
    candidates = []

    for ll in llmap.laneletLayer:
        for p in ll.centerline:
            dist = (p.x - x)**2 + (p.y - y)**2
            candidates.append((dist, ll, [p.x, p.y]))

    candidates.sort(key=lambda c: c[0])

    # return top k unique lanelets
    result = []
    seen_ids = set()

    for _, ll, pt in candidates:
        if ll.id not in seen_ids:
            result.append((ll.id, pt))
            seen_ids.add(ll.id)
        if len(result) >= k:
            break

    return result

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
class MockPoint:
    def __init__(self, x, y):
        self.x = x
        self.y = y

class MockLanelet:
    def __init__(self, id, points):
        self.id = id
        self.centerline = points

class MockMap:
    def __init__(self, lanelets):
        self.laneletLayer = lanelets

# covers test unit2 for TR1, 2, 5
def test_basic_nearest():
    ll1 = MockLanelet(1, [MockPoint(0,0), MockPoint(5,5)])
    ll2 = MockLanelet(2, [MockPoint(10,10)])

    llmap = MockMap([ll1, ll2])

    lanelet_id, point = find_nearest_lanelet(1,1,llmap)

    assert lanelet_id == 1

# covers for unit2 test for TR3, 4
def test_false_branch():
    ll1 = MockLanelet(1, [MockPoint(1,1)])
    ll2 = MockLanelet(2, [MockPoint(100,100)])

    llmap = MockMap([ll1, ll2])

    lanelet_id, point = find_nearest_lanelet(0,0,llmap)

    assert lanelet_id == 1

#covers for unit1 test TR1
def test_no_routing_graph():
    global routing_graph
    routing_graph = None

    result = compute_centerline_route_points(None, None)

    assert result is None

# covers for unit1 test TR2
def test_no_path(monkeypatch):
    class MockGraph:
        def shortestPath(self, a, b):
            return None

    global routing_graph
    routing_graph = MockGraph()

    result = compute_centerline_route_points(None, None)

    assert result is None

# covers for unit1 test TR3, 5, 9
def test_valid_path():
    class MockLanelet:
        def __init__(self):
            self.centerline = [MockPoint(0,0), MockPoint(1,1)]

    class MockGraph:
        def shortestPath(self, a, b):
            return [MockLanelet()]

    global routing_graph
    routing_graph = MockGraph()

    result = compute_centerline_route_points(None, None)

    assert len(result) > 0

# covers for unit1 test TR4
def test_empty_lanelets(monkeypatch):
    class MockGraph:
        def shortestPath(self, a, b):
            return []

    global routing_graph
    routing_graph = MockGraph()

    result = compute_centerline_route_points(None, None)

    assert result is None

# covers TR6, 7, 8, 9
def test_filtered_duplicates():
    class MockLanelet:
        def __init__(self):
            # duplicate consecutive points
            self.centerline = [
                MockPoint(0,0),
                MockPoint(0,0),
                MockPoint(1,1)
            ]

    class MockGraph:
        def shortestPath(self, a, b):
            return [MockLanelet()]

    global routing_graph
    routing_graph = MockGraph()

    result = compute_centerline_route_points(None, None)

    assert result == [[0.0, 0.0], [1.0, 1.0]]

def main():
    global map_data, stops_data, llmap_global, routing_graph, traffic_rules
    try:
        rospy.init_node("lanelet_web_viz")
    except rospy.exceptions.ROSInitException:
        print("Ros master is not running. Please start roscore first.")
        return
    map_path = rospy.get_param("~map_file")
    if not os.path.exists(map_path):
        rospy.logerr("Map file not found")
        return 
    pcd_path = rospy.get_param("~pcd_file", "")

    if pcd_path and os.path.exists(pcd_path):
        rospy.loginfo("Loading PCD file...")
        global pcd_data
        pcd_data = load_pcd_file(pcd_path)

    # initalize Ros node 
    rospy.loginfo("Initializing visualization node...")
    
    rospy.loginfo("Setting up subscribers...")
    llmap, lanelets_json, projector = load_lanelet_map(map_path)
    map_data = lanelets_json
    llmap_global = llmap
    # Build traffic rules + routing graph (done once)
    try:
        traffic_rules = lanelet2.traffic_rules.create("Germany", "Vehicle")
        rospy.loginfo("Routing graph built successfully")
    except Exception:
        traffic_rules = lanelet2.traffic_rules.create(
            lanelet2.traffic_rules.Locations.Germany,
            lanelet2.traffic_rules.Participants.Vehicle
        )

    try:
        routing_graph = lanelet2.routing.RoutingGraph(llmap_global, traffic_rules)
    except Exception:
        routing_graph = lanelet2.routing.RoutingGraph.build(llmap_global, traffic_rules)
    debug_map_bounds(llmap)
    rospy.loginfo(f"Loaded {len(map_data)} lanelets")
    stops_data = build_stops(llmap, projector)
    # set up subscribers to get data from ros topics
    rospy.Subscriber("/vehicle_pose", Pose2D, pose_callback)
    rospy.Subscriber("/predicted_objects", MarkerArray, predicted_callback)
    rospy.Subscriber("/tracked_objects", MarkerArray, tracked_callback)

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
