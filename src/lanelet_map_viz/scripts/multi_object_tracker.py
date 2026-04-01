#!/usr/bin/env python3

import rospy
import numpy as np
from visualization_msgs.msg import MarkerArray, Marker
from geometry_msgs.msg import Point
from tf.transformations import quaternion_from_euler


class Track:
    def __init__(self, track_id, position):
        self.id = track_id
        self.position = np.array(position)
        self.velocity = np.zeros(3)
        self.last_update = rospy.Time.now()
        self.missed_frames = 0


class MultiObjectTracker:

    def __init__(self):

        rospy.init_node("multi_object_tracker")

        self.tracks = []
        self.next_id = 0

        self.max_distance = 1.0      # association threshold (meters)
        self.max_missed = 5          # frames before deleting tracked object

        rospy.Subscriber("/lidar_bboxes", MarkerArray, self.detection_callback)

        self.pub = rospy.Publisher("/tracked_objects", MarkerArray, queue_size=10)

        rospy.loginfo("Multi-object tracker started.")
        rospy.spin()

    def detection_callback(self, msg):

        detections = []

        for marker in msg.markers:
            detections.append([
                marker.pose.position.x,
                marker.pose.position.y,
                marker.pose.position.z
            ])

        detections = np.array(detections)

        self.update_tracks(detections)

        #self.publish_tracks(msg.header)
        self.publish_tracks(msg.markers[0].header)

    def update_tracks(self, detections):

        if len(self.tracks) == 0:
            for det in detections:
                self.tracks.append(Track(self.next_id, det))
                self.next_id += 1
            return

        assigned = set()

        for track in self.tracks:

            if len(detections) == 0:
                track.missed_frames += 1
                continue

            distances = np.linalg.norm(detections - track.position, axis=1)
            min_idx = np.argmin(distances)

            if distances[min_idx] < self.max_distance:
                new_position = detections[min_idx]

                dt = (rospy.Time.now() - track.last_update).to_sec()
                if dt > 0:
                    track.velocity = (new_position - track.position) / dt

                track.position = new_position
                track.last_update = rospy.Time.now()
                track.missed_frames = 0
                assigned.add(min_idx)
            else:
                track.missed_frames += 1

        # Create new tracks for unassigned detections
        for i, det in enumerate(detections):
            if i not in assigned:
                self.tracks.append(Track(self.next_id, det))
                self.next_id += 1

        # Remove dead tracks
        self.tracks = [t for t in self.tracks if t.missed_frames < self.max_missed]

    def publish_tracks(self, header):

        marker_array = MarkerArray()

        for track in self.tracks:

            marker = Marker()
            marker.header = header
            marker.ns = "tracked_objects"
            marker.id = track.id
            marker.type = Marker.SPHERE
            marker.action = Marker.ADD

            marker.pose.position.x = track.position[0]
            marker.pose.position.y = track.position[1]
            marker.pose.position.z = track.position[2]

            marker.scale.x = 0.6
            marker.scale.y = 0.6
            marker.scale.z = 0.6

            marker.color.r = 1.0
            marker.color.g = 0.0
            marker.color.b = 0.0
            marker.color.a = 1.0

            marker.lifetime = rospy.Duration(0.3)

            marker_array.markers.append(marker)

        self.pub.publish(marker_array)


if __name__ == "__main__":
    try:
        MultiObjectTracker()
    except rospy.ROSInterruptException:
        pass