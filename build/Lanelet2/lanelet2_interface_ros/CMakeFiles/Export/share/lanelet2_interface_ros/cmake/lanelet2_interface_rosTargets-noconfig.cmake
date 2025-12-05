#----------------------------------------------------------------
# Generated CMake target import file.
#----------------------------------------------------------------

# Commands may need to know the format version.
set(CMAKE_IMPORT_FILE_VERSION 1)

# Import target "lanelet2_interface_ros::lanelet2_interface_ros" for configuration ""
set_property(TARGET lanelet2_interface_ros::lanelet2_interface_ros APPEND PROPERTY IMPORTED_CONFIGURATIONS NOCONFIG)
set_target_properties(lanelet2_interface_ros::lanelet2_interface_ros PROPERTIES
  IMPORTED_LOCATION_NOCONFIG "${_IMPORT_PREFIX}/lib/liblanelet2_interface_ros.so.1.0.0"
  IMPORTED_SONAME_NOCONFIG "liblanelet2_interface_ros.so.1"
  )

list(APPEND _IMPORT_CHECK_TARGETS lanelet2_interface_ros::lanelet2_interface_ros )
list(APPEND _IMPORT_CHECK_FILES_FOR_lanelet2_interface_ros::lanelet2_interface_ros "${_IMPORT_PREFIX}/lib/liblanelet2_interface_ros.so.1.0.0" )

# Commands beyond this point should not need to know the version.
set(CMAKE_IMPORT_FILE_VERSION)
