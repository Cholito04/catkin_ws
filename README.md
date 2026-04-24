README: Web-Based Lanelet2 Visualization Overview

This system provides a web-based visualization of a Lanelet2 map, vehicle position, and perception data using a ROS backend and a Three.js frontend. The visualization runs in a browser and displays:

Lanelet2 road geometry Vehicle position (real or simulated) Bus stops Planned routes Tracked and predicted objects

The backend (viz_browser.py) acts as a bridge between ROS and the web interface by exposing data through HTTP endpoints.

How to Run the Visualization

Start ROS Core
Make sure ROS is running:

roscore 2. Build and Source Workspace cd ~/catkin_ws catkin_make source devel/setup.bash 3. Launch the System

Run your unified launch file:

roslaunch lanelet_map_viz browser_gps.launch

This will start:

Visualization node (viz_browser.py) GPS/pose node (or simulation) Tracking and prediction nodes (if included) 4. Open the Web Interface

The system will automatically:

Start a local HTTP server Open your browser to a page like: http://localhost:/temp.html

If it does not open automatically, check the terminal output for the port number and open it manually.

Using the Interface Select a start and goal stop from the GUI The system computes a route using Lanelet2 The route is drawn on the map The vehicle will: Either display real GPS position Or simulate motion along the route

Additional visual layers:

Stops → selectable destinations Route → computed path Vehicle → current position Kinematics → tracked + predicted objects
