#----------------------------------------------------------------
# Generated CMake target import file.
#----------------------------------------------------------------

# Commands may need to know the format version.
set(CMAKE_IMPORT_FILE_VERSION 1)

# Import target "util_rviz::util_rviz" for configuration ""
set_property(TARGET util_rviz::util_rviz APPEND PROPERTY IMPORTED_CONFIGURATIONS NOCONFIG)
set_target_properties(util_rviz::util_rviz PROPERTIES
  IMPORTED_LOCATION_NOCONFIG "${_IMPORT_PREFIX}/lib/libutil_rviz.so.1.0.0"
  IMPORTED_SONAME_NOCONFIG "libutil_rviz.so.1"
  )

list(APPEND _IMPORT_CHECK_TARGETS util_rviz::util_rviz )
list(APPEND _IMPORT_CHECK_FILES_FOR_util_rviz::util_rviz "${_IMPORT_PREFIX}/lib/libutil_rviz.so.1.0.0" )

# Commands beyond this point should not need to know the version.
set(CMAKE_IMPORT_FILE_VERSION)
