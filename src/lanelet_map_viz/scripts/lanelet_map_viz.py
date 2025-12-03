#!/usr/bin/env python3
import rospy
from visualization_msgs.msg import Marker, MarkerArray
from geometry_msgs.msg import Point
import lanelet2
from lanelet2.projection import UtmProjector
import numpy as np
import os


#  CLASS 1 — Converts Lanelet2 geometry to ROS Point lists
class LaneletConverter:
    @staticmethod
    def to_ros_points(ll_points):
        """Convert lanelet2 line (left, right, center) into ROS Point list."""
        ros_pts = []
        for pt in ll_points:
            p = Point()
            p.x = pt.x
            p.y = pt.y
            p.z = getattr(pt, "z", 0.0)
            ros_pts.append(p)
        return ros_pts


#  CLASS 2 — Builds Markers with styling
class MarkerFactory:
    def __init__(self, frame_id="map"):
        self.frame_id = frame_id

    def make_line_marker(self, marker_id, pts, width, r, g, b, a):
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

        # identity orientation
        marker.pose.orientation.w = 1.0

        marker.points = pts
        return marker

    def build_lanelet_markers(self, marker_id_start, left_pts, right_pts, center_pts):
        """Creates 3 markers for each lanelet: left, right, center."""
        markers = []
        mid = marker_id_start

        # LEFT boundary (bright blue, semi-transparent)
        markers.append(
            self.make_line_marker(
                mid, left_pts, width=0.15,
                r=1.0, g=1.0, b=1.0, a=0.5
            )
        )
        mid += 1

        # RIGHT boundary (dark blue, semi-transparent)
        markers.append(
            self.make_line_marker(
                mid, right_pts, width=0.15,
                r=1.0, g=1.0, b=1.0, a=0.5
            )
        )
        mid += 1

        # CENTER (thin bright line)
        markers.append(
            self.make_line_marker(
                mid, center_pts, width=0.05,
                r=1.0, g=1.0, b=0.0, a=1.0
            )
        )
        mid += 1

        return markers, mid


#  CLASS 3 — ROS Node Handling Everything
class LaneletVisualizerNode:
    def __init__(self):
        rospy.init_node("lanelet_map_viz")

        # Parameters
        self.map_file = rospy.get_param("~map_file")
        self.frame_id = rospy.get_param("~frame_id", "map")

        self.pub = rospy.Publisher("/lanelet_markers", MarkerArray, queue_size=10)

        if not os.path.exists(self.map_file):
            rospy.logerr(f"Map not found: {self.map_file}")
            raise FileNotFoundError(self.map_file)

        # Load map
        origin = lanelet2.io.Origin(41.5489, -85.7965)
        projector = UtmProjector(origin)
        self.llmap = lanelet2.io.load(self.map_file, projector)

        rospy.loginfo(f"Loaded map with {len(self.llmap.laneletLayer)} lanelets.")

        self.converter = LaneletConverter()
        self.factory = MarkerFactory(frame_id=self.frame_id)


    def run(self):
        rate = rospy.Rate(1)
        while not rospy.is_shutdown():
            marker_array = MarkerArray()
            marker_id = 0

            for llt in self.llmap.laneletLayer:
                left = self.converter.to_ros_points(llt.leftBound)
                right = self.converter.to_ros_points(llt.rightBound)
                center = self.converter.to_ros_points(llt.centerline)

                if len(center) == 0:
                    continue

                markers, marker_id = self.factory.build_lanelet_markers(
                    marker_id, left, right, center
                )

                for m in markers:
                    marker_array.markers.append(m)

            self.pub.publish(marker_array)
            rate.sleep()


#  MAIN ENTRY POINT
if __name__ == "__main__":
    try:
        node = LaneletVisualizerNode()
        node.run()
    except rospy.ROSInterruptException:
        pass

