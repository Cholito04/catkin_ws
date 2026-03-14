# Install script for directory: /home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_multi_rtk_ros

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
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/pkgconfig" TYPE FILE FILES "/home/cholito/catkin_ws/build/ethz_piksi_ros/piksi_multi_rtk_ros/catkin_generated/installspace/piksi_multi_rtk_ros.pc")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/share/piksi_multi_rtk_ros/cmake" TYPE FILE FILES
    "/home/cholito/catkin_ws/build/ethz_piksi_ros/piksi_multi_rtk_ros/catkin_generated/installspace/piksi_multi_rtk_rosConfig.cmake"
    "/home/cholito/catkin_ws/build/ethz_piksi_ros/piksi_multi_rtk_ros/catkin_generated/installspace/piksi_multi_rtk_rosConfig-version.cmake"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/share/piksi_multi_rtk_ros" TYPE FILE FILES "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_multi_rtk_ros/package.xml")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  include("/home/cholito/catkin_ws/build/ethz_piksi_ros/piksi_multi_rtk_ros/catkin_generated/safe_execute_install.cmake")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/piksi_multi_rtk_ros" TYPE PROGRAM FILES "/home/cholito/catkin_ws/build/ethz_piksi_ros/piksi_multi_rtk_ros/catkin_generated/installspace/piksi_multi")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/piksi_multi_rtk_ros" TYPE PROGRAM FILES "/home/cholito/catkin_ws/build/ethz_piksi_ros/piksi_multi_rtk_ros/catkin_generated/installspace/geodetic_survey")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/share/piksi_multi_rtk_ros" TYPE DIRECTORY FILES
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_multi_rtk_ros/cfg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_multi_rtk_ros/launch"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_multi_rtk_ros/log_surveys"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_multi_rtk_ros/rosbag_record_scripts"
    )
endif()

