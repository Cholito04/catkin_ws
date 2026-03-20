#!/usr/bin/env python3

import rospy
import tf
import math

from geometry_msgs.msg import Pose2D
from geometry_msgs.msg import PoseWithCovarianceStamped
from piksi_rtk_msgs.msg import BaselineHeading
import tf2_ros
import geometry_msgs.msg


class VehiclePoseNode:

    def __init__(self):

        rospy.init_node("vehicle_pose_node")

        self.x = 0
        self.y = 0
        self.yaw = 0

        self.pub = rospy.Publisher("/vehicle_pose", Pose2D, queue_size=10)

        self.br = tf2_ros.TransformBroadcaster()

        rospy.Subscriber(
            "/piksi/enu_pose_best_fix",
            PoseWithCovarianceStamped,
            self.pos_callback
        )

        rospy.Subscriber(
            "/piksi/baseline_heading",
            BaselineHeading,
            self.heading_callback
        )

    def pos_callback(self, msg):

        self.x = msg.pose.pose.position.x
        self.y = msg.pose.pose.position.y

        self.publish()

    def heading_callback(self, msg):

        self.yaw = math.radians(msg.heading)

        self.publish()

    def publish(self):

        pose = Pose2D()
        pose.x = self.x
        pose.y = self.y
        pose.theta = self.yaw
        self.pub.publish(pose)

        t = geometry_msgs.msg.TransformStamped()

        t.header.stamp = rospy.Time.now()
        t.header.frame_id = "map"
        t.child_frame_id = "vehicle"

        t.transform.translation.x = self.x
        t.transform.translation.y = self.y
        t.transform.translation.z = 0.0

        q = tf.transformations.quaternion_from_euler(0, 0, self.yaw)

        t.transform.rotation.x = q[0]
        t.transform.rotation.y = q[1]
        t.transform.rotation.z = q[2]
        t.transform.rotation.w = q[3]

        self.br.sendTransform(t)


if __name__ == "__main__":
    VehiclePoseNode()
    rospy.spin()