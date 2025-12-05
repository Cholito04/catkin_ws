#!/usr/bin/env python3

import os
import rospy
from geometry_msgs.msg import Point
from visualization_msgs.msg import Marker, MarkerArray

import lanelet2
from lanelet2.projection import UtmProjector


#  CLASS 1: onverts Lanelet2 geometry → ROS Points
class LaneletConverter:
    # Utility class to convert lanelet geometry into ROS Point messages.

    @staticmethod
    def to_ros_points(ll_points):
        # Converts a sequence of lanelet2 points into geometry_msgs/Point list.
        ros_points = []

        for pt in ll_points:
            p = Point()
            p.x = pt.x
            p.y = pt.y
            p.z = getattr(pt, "z", 0.0)
            ros_points.append(p)

        return ros_points


#  CLASS 2: Holds visual style configs for easy editing
class MarkerStyle:
    LEFT_COLOR = (1.0, 1.0, 1.0, 0.5)
    RIGHT_COLOR = (1.0, 1.0, 1.0, 0.5)
    CENTER_COLOR = (1.0, 1.0, 0.0, 1.0)

    LEFT_WIDTH = 0.15
    RIGHT_WIDTH = 0.15
    CENTER_WIDTH = 0.05


#  CLASS 3: builds Markers cleanly
class MarkerFactory:
    def __init__(self, frame_id="map"):
        self.frame_id = frame_id

    def _make_line_strip(self, marker_id, points, width, rgba):
        r, g, b, a = rgba

        marker = Marker()
        marker.header.frame_id = self.frame_id
        marker.header.stamp = rospy.Time.now()

        marker.ns = "lanelets"
        marker.id = marker_id
        marker.type = Marker.LINE_STRIP
        marker.action = Marker.ADD

        marker.scale.x = width
        marker.color.r = r
        marker.color.g = g
        marker.color.b = b
        marker.color.a = a

        marker.pose.orientation.w = 1.0
        marker.points = points

        return marker

    def lanelet_markers(self, start_id, left, right, center):
        # Return list of 3 markers for left, right, and center lines.
        markers = []
        mid = start_id

        markers.append(
            self._make_line_strip(
                mid, left,
                MarkerStyle.LEFT_WIDTH, MarkerStyle.LEFT_COLOR
            )
        )
        mid += 1

        markers.append(
            self._make_line_strip(
                mid, right,
                MarkerStyle.RIGHT_WIDTH, MarkerStyle.RIGHT_COLOR
            )
        )
        mid += 1

        markers.append(
            self._make_line_strip(
                mid, center,
                MarkerStyle.CENTER_WIDTH, MarkerStyle.CENTER_COLOR
            )
        )
        mid += 1

        return markers, mid


#  CLASS 4: ROS Node Itself (Loads map + Publishes markers)
class LaneletVisualizerNode:
    def __init__(self):
        rospy.init_node("lanelet_map_viz")

        self.map_file = rospy.get_param("~map_file")
        self.frame_id = rospy.get_param("~frame_id", "map")

        self.pub = rospy.Publisher(
            "/lanelet_markers",
            MarkerArray,
            queue_size=10
        )

        self._validate_map_path()
        self._load_map()

        self.converter = LaneletConverter()
        self.factory = MarkerFactory(self.frame_id)


    # Setup utilities
    def _validate_map_path(self):
        if not self.map_file or not os.path.exists(self.map_file):
            rospy.logerr(f"[LaneletVisualizer] Map file not found: {self.map_file}")
            raise FileNotFoundError(self.map_file)

    def _load_map(self):
        origin = lanelet2.io.Origin(41.5489, -85.7965)
        projector = UtmProjector(origin)

        rospy.loginfo(f"[LaneletVisualizer] Loading map: {self.map_file}")
        self.llmap = lanelet2.io.load(self.map_file, projector)
        rospy.loginfo(
            f"[LaneletVisualizer] Loaded {len(self.llmap.laneletLayer)} lanelets."
        )

    # Main loop
    def run(self):
        rate = rospy.Rate(1)
        marker_id = 0

        while not rospy.is_shutdown():
            markers = MarkerArray()
            marker_id = 0  # Reset every cycle for stable marker IDs

            for lanelet in self.llmap.laneletLayer:

                left = self.converter.to_ros_points(lanelet.leftBound)
                right = self.converter.to_ros_points(lanelet.rightBound)
                center = self.converter.to_ros_points(lanelet.centerline)

                if not center:
                    continue

                block, marker_id = self.factory.lanelet_markers(
                    marker_id, left, right, center
                )

                markers.markers.extend(block)

            self.pub.publish(markers)
            rate.sleep()


#  MAIN
if __name__ == "__main__":
    try:
        node = LaneletVisualizerNode()
        node.run()
    except rospy.ROSInterruptException:
        pass
