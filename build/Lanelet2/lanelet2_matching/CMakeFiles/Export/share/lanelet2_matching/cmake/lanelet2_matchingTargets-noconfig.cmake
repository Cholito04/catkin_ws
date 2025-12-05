#----------------------------------------------------------------
# Generated CMake target import file.
#----------------------------------------------------------------

# Commands may need to know the format version.
set(CMAKE_IMPORT_FILE_VERSION 1)

# Import target "lanelet2_matching::lanelet2_matching" for configuration ""
set_property(TARGET lanelet2_matching::lanelet2_matching APPEND PROPERTY IMPORTED_CONFIGURATIONS NOCONFIG)
set_target_properties(lanelet2_matching::lanelet2_matching PROPERTIES
  IMPORTED_LOCATION_NOCONFIG "${_IMPORT_PREFIX}/lib/liblanelet2_matching.so.1.2.2"
  IMPORTED_SONAME_NOCONFIG "liblanelet2_matching.so.1"
  )

list(APPEND _IMPORT_CHECK_TARGETS lanelet2_matching::lanelet2_matching )
list(APPEND _IMPORT_CHECK_FILES_FOR_lanelet2_matching::lanelet2_matching "${_IMPORT_PREFIX}/lib/liblanelet2_matching.so.1.2.2" )

# Commands beyond this point should not need to know the version.
set(CMAKE_IMPORT_FILE_VERSION)
