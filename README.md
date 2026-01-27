# rosworkspace
ros workspace that loads a lanelet2 map into rvizz.

Make sure you have the following thingsL: 
1. install rosnoetic run - sudo apt install ros-noetic-desktop if that doesn't you might have to go to https://wiki.ros.org/noetic/Installation/Ubuntu and follow the instuctions
2. after install run source /opt/ros/noetic/setup.bash (have to do this everytime you start a new terminal)
3. you might need to run - "sudo apt install rospy"
4. you shouldnt need to isntall lanelet2 since its included in the repo already
5. then make sure you git clone the repo


RUN THE FOLLOWING COMMANDS:
1. cd ~/catkin_ws
2. catkin_make (might take a while)
3. source devel/setup.bash (run everytime you want to work on the workspace/open a new terminal)
4. roslaunch lanelet_map_viz visualize.launch map_file:=/home/<username>/catkin_ws/src/lanelet_map_viz/maps/new_lanelet2_maps.osm frame_id:=map

Rvizz should open after that(make sure to change username to whatever your username is in linux or just copy the path of the new_lanelet2_maps.osm after the equal.
in rviz click add in the bottom left go to "by topics" and add the lanelet_markers , markerArray you should see things in the display might need to zoom out a tadbit. 

To add more nodes to the workspace add run:
1. cd ~/catkin_ws/src
2. catki_create_pkg <name of node> pospy std_msgs geometry_msgs
3. add python script in the src folder
4. make py file executable with chmod
5. cd ~/catkin_ws
6. catkin_make
7. source devel/setup.bash
8. add launch folder
9. add launch file in folder
