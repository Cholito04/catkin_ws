# Install script for directory: /home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_kml

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
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/pkgconfig" TYPE FILE FILES "/home/cholito/catkin_ws/build/ethz_piksi_ros/piksi_rtk_kml/catkin_generated/installspace/piksi_rtk_kml.pc")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/share/piksi_rtk_kml/cmake" TYPE FILE FILES
    "/home/cholito/catkin_ws/build/ethz_piksi_ros/piksi_rtk_kml/catkin_generated/installspace/piksi_rtk_kmlConfig.cmake"
    "/home/cholito/catkin_ws/build/ethz_piksi_ros/piksi_rtk_kml/catkin_generated/installspace/piksi_rtk_kmlConfig-version.cmake"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/share/piksi_rtk_kml" TYPE FILE FILES "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_kml/package.xml")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  include("/home/cholito/catkin_ws/build/ethz_piksi_ros/piksi_rtk_kml/catkin_generated/safe_execute_install.cmake")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/piksi_rtk_kml" TYPE PROGRAM FILES "/home/cholito/catkin_ws/build/ethz_piksi_ros/piksi_rtk_kml/catkin_generated/installspace/piksi_rtk_kml")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/share/piksi_rtk_kml" TYPE DIRECTORY FILES
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_kml/cfg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_kml/launch"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_kml/kml"
    )
endif()

