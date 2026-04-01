#!/usr/bin/env python3

import rospy
import numpy as np
from visualization_msgs.msg import MarkerArray, Marker


class MultiObjectPrediction:

    def __init__(self):

        rospy.init_node("multi_object_prediction")

        # Object state dictionary
        # id → {position, velocity, last_time}
        self.objects = {}

        # Prediction parameters
        self.prediction_horizon = 1.0     # seconds ahead
        self.trajectory_points = 10       # points in predicted path
        self.max_idle_time = 1.0          # remove object if unseen (seconds)

        # Subscribers
        rospy.Subscriber(
            "/tracked_objects",
            MarkerArray,
            self.tracked_callback
        )

        # Publishers
        self.prediction_pub = rospy.Publisher(
            "/predicted_objects",
            MarkerArray,
            queue_size=10
        )

        self.trajectory_pub = rospy.Publisher(
            "/predicted_trajectories",
            MarkerArray,
            queue_size=10
        )

        rospy.loginfo("Multi-object prediction node started.")
        rospy.spin()

    # ==========================================================
    # TRACKED OBJECT CALLBACK
    # ==========================================================

    def tracked_callback(self, msg):

        current_time = rospy.Time.now()
        active_ids = set()

        for marker in msg.markers:

            obj_id = marker.id
            active_ids.add(obj_id)

            position = np.array([
                marker.pose.position.x,
                marker.pose.position.y,
                marker.pose.position.z
            ])

            if obj_id not in self.objects:
                # Initialize new object
                self.objects[obj_id] = {
                    "position": position,
                    "velocity": np.zeros(3),
                    "last_time": current_time
                }
                continue

            # Update existing object
            prev_position = self.objects[obj_id]["position"]
            prev_time = self.objects[obj_id]["last_time"]

            dt = (current_time - prev_time).to_sec()

            if dt > 0:
                velocity = (position - prev_position) / dt
            else:
                velocity = np.zeros(3)

            self.objects[obj_id]["position"] = position
            self.objects[obj_id]["velocity"] = velocity
            self.objects[obj_id]["last_time"] = current_time

        # Remove stale objects
        self.remove_stale_objects(current_time)

        # Publish predictions
        #self.publish_predictions(msg.header)
        if len(msg.markers) > 0:
            self.publish_predictions(msg.markers[0].header)
        #self.publish_trajectories(msg.header)

    # ==========================================================
    # REMOVE STALE TRACKS
    # ==========================================================

    def remove_stale_objects(self, current_time):

        to_delete = []

        for obj_id, state in self.objects.items():
            dt = (current_time - state["last_time"]).to_sec()
            if dt > self.max_idle_time:
                to_delete.append(obj_id)

        for obj_id in to_delete:
            del self.objects[obj_id]

    # ==========================================================
    # PUBLISH PREDICTED POSITIONS
    # ==========================================================

    def publish_predictions(self, header):

        marker_array = MarkerArray()

        for obj_id, state in self.objects.items():

            predicted_position = (
                state["position"] + state["velocity"] * self.prediction_horizon
                )

            marker = Marker()
            marker.header = header
            marker.ns = "predicted_objects"
            marker.id = obj_id
            marker.type = Marker.SPHERE
            marker.action = Marker.ADD

            marker.pose.position.x = predicted_position[0]
            marker.pose.position.y = predicted_position[1]
            marker.pose.position.z = predicted_position[2]

            marker.scale.x = 0.6
            marker.scale.y = 0.6
            marker.scale.z = 0.6

            # Blue = prediction
            marker.color.r = 0.0
            marker.color.g = 0.0
            marker.color.b = 1.0
            marker.color.a = 1.0

            marker.lifetime = rospy.Duration(0.2)

            marker_array.markers.append(marker)

        self.prediction_pub.publish(marker_array)

    # ==========================================================
    # PUBLISH TRAJECTORY LINES
    # ==========================================================

    def publish_trajectories(self, header):

        marker_array = MarkerArray()

        for obj_id, state in self.objects.items():

            marker = Marker()
            marker.header = header
            marker.ns = "predicted_trajectory"
            marker.id = obj_id
            marker.type = Marker.LINE_STRIP
            marker.action = Marker.ADD

            marker.scale.x = 0.15  # line width

            marker.color.r = 0.0
            marker.color.g = 0.5
            marker.color.b = 1.0
            marker.color.a = 1.0

            dt = self.prediction_horizon / self.trajectory_points

            for i in range(self.trajectory_points + 1):
                t = i * dt
                future_position = (
                    state["position"] +
                    state["velocity"] * t
                )

                point = rospy.geometry_msgs.msg.Point()
                point.x = future_position[0]
                point.y = future_position[1]
                point.z = future_position[2]

                marker.points.append(point)

            marker.lifetime = rospy.Duration(0.2)

            marker_array.markers.append(marker)

        self.trajectory_pub.publish(marker_array)


if __name__ == "__main__":
    try:
        MultiObjectPrediction()
    except rospy.ROSInterruptException:
        pass