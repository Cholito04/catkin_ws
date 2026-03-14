# generated from catkin/cmake/template/pkg.context.pc.in
CATKIN_PACKAGE_PREFIX = ""
PROJECT_PKG_CONFIG_INCLUDE_DIRS = "${prefix}/include".split(';') if "${prefix}/include" != "" else []
PROJECT_CATKIN_DEPENDS = "libsbp_catkin;roscpp;libsbp_ros_msgs;piksi_rtk_msgs;std_msgs;geometry_msgs;sensor_msgs;eigen_conversions;roslib;libserialport_catkin".replace(';', ' ')
PKG_CONFIG_LIBRARIES_WITH_PREFIX = "-lpiksi_multi_cpp".split(';') if "-lpiksi_multi_cpp" != "" else []
PROJECT_NAME = "piksi_multi_cpp"
PROJECT_SPACE_DIR = "/home/cholito/catkin_ws/install"
PROJECT_VERSION = "0.0.1"
