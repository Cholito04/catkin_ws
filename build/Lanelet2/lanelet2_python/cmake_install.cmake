# Install script for directory: /home/cholito/catkin_ws/src/Lanelet2/lanelet2_python

# Set the install prefix
if(NOT DEFINED CMAKE_INSTALL_PREFIX)
  set(CMAKE_INSTALL_PREFIX "/home/cholito/catkin_ws/install")
endif()
string(REGEX REPLACE "/$" "" CMAKE_INSTALL_PREFIX "${CMAKE_INSTALL_PREFIX}")

# Set the install configuration name.
if(NOT DEFINED CMAKE_INSTALL_CONFIG_NAME)
  if(BUILD_TYPE)
    string(REGEX REPLACE "^[^A-Za-z0-9_]+" ""
           CMAKE_INSTALL_CONFIG_NAME "${BUILD_TYPE}")
  else()
    set(CMAKE_INSTALL_CONFIG_NAME "")
  endif()
  message(STATUS "Install configuration: \"${CMAKE_INSTALL_CONFIG_NAME}\"")
endif()

# Set the component getting installed.
if(NOT CMAKE_INSTALL_COMPONENT)
  if(COMPONENT)
    message(STATUS "Install component: \"${COMPONENT}\"")
    set(CMAKE_INSTALL_COMPONENT "${COMPONENT}")
  else()
    set(CMAKE_INSTALL_COMPONENT)
  endif()
endif()

# Install shared libraries without execute permission?
if(NOT DEFINED CMAKE_INSTALL_SO_NO_EXE)
  set(CMAKE_INSTALL_SO_NO_EXE "1")
endif()

# Is this installation the result of a crosscompile?
if(NOT DEFINED CMAKE_CROSSCOMPILING)
  set(CMAKE_CROSSCOMPILING "FALSE")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  execute_process(COMMAND /usr/bin/python3 /home/cholito/catkin_ws/build/Lanelet2/lanelet2_python/python_api_install.py)
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/python3/dist-packages/lanelet2" TYPE FILE FILES
    "/home/cholito/catkin_ws/src/Lanelet2/lanelet2_python/typings/lanelet2/__init__.pyi"
    "/home/cholito/catkin_ws/src/Lanelet2/lanelet2_python/typings/lanelet2/core.pyi"
    "/home/cholito/catkin_ws/src/Lanelet2/lanelet2_python/typings/lanelet2/geometry.pyi"
    "/home/cholito/catkin_ws/src/Lanelet2/lanelet2_python/typings/lanelet2/io.pyi"
    "/home/cholito/catkin_ws/src/Lanelet2/lanelet2_python/typings/lanelet2/matching.pyi"
    "/home/cholito/catkin_ws/src/Lanelet2/lanelet2_python/typings/lanelet2/projection.pyi"
    "/home/cholito/catkin_ws/src/Lanelet2/lanelet2_python/typings/lanelet2/routing.pyi"
    "/home/cholito/catkin_ws/src/Lanelet2/lanelet2_python/typings/lanelet2/traffic_rules.pyi"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/include/lanelet2_python" TYPE DIRECTORY FILES "/home/cholito/catkin_ws/src/Lanelet2/lanelet2_python/include/lanelet2_python/" FILES_MATCHING REGEX "/[^/]*\\.h$" REGEX "/[^/]*\\.hpp$" REGEX "/[^/]*\\.hh$" REGEX "/[^/]*\\.cuh$")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/lanelet2_python" TYPE PROGRAM FILES "/home/cholito/catkin_ws/build/Lanelet2/lanelet2_python/catkin_generated/installspace/create_debug_routing_graph.py")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/lanelet2_python" TYPE PROGRAM FILES "/home/cholito/catkin_ws/build/Lanelet2/lanelet2_python/catkin_generated/installspace/make_ids_positive.py")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/lanelet2_python" TYPE PROGRAM FILES "/home/cholito/catkin_ws/build/Lanelet2/lanelet2_python/catkin_generated/installspace/print_ids.py")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  if(EXISTS "$ENV{DESTDIR}${CMAKE_INSTALL_PREFIX}/share/lanelet2_python/cmake/lanelet2_pythonTargets.cmake")
    file(DIFFERENT EXPORT_FILE_CHANGED FILES
         "$ENV{DESTDIR}${CMAKE_INSTALL_PREFIX}/share/lanelet2_python/cmake/lanelet2_pythonTargets.cmake"
         "/home/cholito/catkin_ws/build/Lanelet2/lanelet2_python/CMakeFiles/Export/share/lanelet2_python/cmake/lanelet2_pythonTargets.cmake")
    if(EXPORT_FILE_CHANGED)
      file(GLOB OLD_CONFIG_FILES "$ENV{DESTDIR}${CMAKE_INSTALL_PREFIX}/share/lanelet2_python/cmake/lanelet2_pythonTargets-*.cmake")
      if(OLD_CONFIG_FILES)
        message(STATUS "Old export file \"$ENV{DESTDIR}${CMAKE_INSTALL_PREFIX}/share/lanelet2_python/cmake/lanelet2_pythonTargets.cmake\" will be replaced.  Removing files [${OLD_CONFIG_FILES}].")
        file(REMOVE ${OLD_CONFIG_FILES})
      endif()
    endif()
  endif()
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/share/lanelet2_python/cmake" TYPE FILE FILES "/home/cholito/catkin_ws/build/Lanelet2/lanelet2_python/CMakeFiles/Export/share/lanelet2_python/cmake/lanelet2_pythonTargets.cmake")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/share/lanelet2_python/cmake" TYPE FILE FILES "/home/cholito/catkin_ws/devel/share/lanelet2_python/cmake/lanelet2_pythonConfigVersion.cmake")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/share/lanelet2_python/cmake" TYPE FILE FILES
    "/home/cholito/catkin_ws/devel/share/lanelet2_python/cmake/lanelet2_pythonConfig.cmake"
    "/home/cholito/catkin_ws/build/Lanelet2/lanelet2_python/CMakeFiles/auto_dep_vars.cmake"
    "/home/cholito/catkin_ws/devel/share/lanelet2_python/cmake/lanelet2_pythonAutoDepsConfig.cmake"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/share/lanelet2_python" TYPE FILE FILES "/home/cholito/catkin_ws/src/Lanelet2/lanelet2_python/package.xml")
endif()

