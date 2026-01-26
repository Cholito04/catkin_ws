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

#global variables to store data
vehicle_pose = None
map_data = None
data_lock = threading.Lock()


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
        else:
            super().do_GET()


def find_free_port():
    """Find a free port to run the HTTP server on"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]


def pose_callback(msg):
    global vehicle_pose

    q = msg.pose.orientation
    yaw = euler_from_quaternion([q.x, q.y, q.z, q.w])[2]

    with data_lock:
        vehicle_pose = {
            "x": msg.pose.position.x,
            "y": msg.pose.position.y,
            "yaw": yaw
        }


def load_lanelet_map(map_path):
    origin = lanelet2.io.Origin(42.28449, -85.61864)
    projector = UtmProjector(origin)

    llmap = lanelet2.io.load(map_path, projector)

    lanelets_json = []

    for ll in llmap.laneletLayer:
        lanelets_json.append({
            "left": [[p.x, p.y] for p in ll.leftBound],
            "right": [[p.x, p.y] for p in ll.rightBound],
            "center": [[p.x, p.y] for p in ll.centerline]
        })
    
    return lanelets_json


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


def main():
    global map_data

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
    map_data = load_lanelet_map(map_path)
    rospy.loginfo(f"Loaded {len(map_data)} lanelets")

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