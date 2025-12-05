#!/usr/bin/env python3
import rospy
import tf
from tf.transformations import quaternion_from_euler
import math

class MapToUTMNode:
    def __init__(self):
        # -----------------------
        # ROS Node init
        # -----------------------
        rospy.init_node("map_to_utm_tf_publisher")

        # -----------------------
        # Load parameters
        # -----------------------
        self.lat_origin = rospy.get_param("~lat_origin", 41.5489)
        self.lon_origin = rospy.get_param("~lon_origin", -85.7965)
        self.map_frame = rospy.get_param("~map_frame", "map")
        self.utm_frame = rospy.get_param("~utm_frame", "actual_utm_no_offset")
        self.publish_rate = rospy.get_param("~publish_rate", 10.0)  # Hz

        # -----------------------
        # TF broadcaster
        # -----------------------
        self.tf_broadcaster = tf.TransformBroadcaster()

        rospy.loginfo(f"[MapToUTM] map_frame: {self.map_frame}, utm_frame: {self.utm_frame}")
        rospy.loginfo(f"[MapToUTM] lat_origin: {self.lat_origin}, lon_origin: {self.lon_origin}")

    def run(self):
        rate = rospy.Rate(self.publish_rate)
        while not rospy.is_shutdown():
            # -----------------------
            # Compute offset if needed
            # For now, no rotation, just translation from origin
            # -----------------------
            x_offset = 0.0
            y_offset = 0.0
            z_offset = 0.0

            # Identity rotation
            quat = quaternion_from_euler(0, 0, 0)

            # Broadcast TF
            self.tf_broadcaster.sendTransform(
                (x_offset, y_offset, z_offset),
                quat,
                rospy.Time.now(),
                self.map_frame,
                self.utm_frame
            )

            rate.sleep()


if __name__ == "__main__":
    try:
        node = MapToUTMNode()
        node.run()
    except rospy.ROSInterruptException:
        pass

