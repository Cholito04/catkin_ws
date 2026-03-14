# Install script for directory: /home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs

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
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/share/piksi_rtk_msgs/msg" TYPE FILE FILES
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/AgeOfCorrections.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/BaselineEcef.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/BaselineHeading.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/BaselineNed.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/BasePosEcef.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/BasePosLlh.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/DeviceMonitor_V2_3_15.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/Dops.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/DopsMulti.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/ExtEvent.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/GpsTime.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/GpsTimeMulti.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/Heartbeat.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/ImuAuxMulti.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/ImuRawMulti.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/InfoWifiCorrections.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/Log.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/MagRaw.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/MeasurementState_V2_4_1.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/Observation.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/PosEcef.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/PosEcefCov.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/PositionSampling.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/PositionWithCovariance.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/PositionWithCovarianceStamped.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/PosLlh.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/PosLlhCov.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/PosLlhMulti.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/ReceiverState.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/ReceiverState_V2_2_15.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/ReceiverState_V2_3_15.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/ReceiverState_V2_4_1.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/ReceiverState_V2_6_5.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/TrackingState.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/TrackingState_V2_2_15.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/TrackingState_V2_3_15.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/TrackingState_V2_6_3.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/UartState.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/UartState_V2_3_15.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/UtcTimeMulti.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/VelEcef.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/VelEcefCov.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/VelNed.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/VelNedCov.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/VelocityWithCovariance.msg"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/msg/VelocityWithCovarianceStamped.msg"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/share/piksi_rtk_msgs/srv" TYPE FILE FILES
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/srv/EnuOrigin.srv"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/srv/SamplePosition.srv"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/srv/SettingsWrite.srv"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/srv/SettingsReadReq.srv"
    "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/srv/SettingsReadResp.srv"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/share/piksi_rtk_msgs/cmake" TYPE FILE FILES "/home/cholito/catkin_ws/build/ethz_piksi_ros/piksi_rtk_msgs/catkin_generated/installspace/piksi_rtk_msgs-msg-paths.cmake")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/include" TYPE DIRECTORY FILES "/home/cholito/catkin_ws/devel/include/piksi_rtk_msgs")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/share/roseus/ros" TYPE DIRECTORY FILES "/home/cholito/catkin_ws/devel/share/roseus/ros/piksi_rtk_msgs")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/share/common-lisp/ros" TYPE DIRECTORY FILES "/home/cholito/catkin_ws/devel/share/common-lisp/ros/piksi_rtk_msgs")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/share/gennodejs/ros" TYPE DIRECTORY FILES "/home/cholito/catkin_ws/devel/share/gennodejs/ros/piksi_rtk_msgs")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  execute_process(COMMAND "/usr/bin/python3" -m compileall "/home/cholito/catkin_ws/devel/lib/python3/dist-packages/piksi_rtk_msgs")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/python3/dist-packages" TYPE DIRECTORY FILES "/home/cholito/catkin_ws/devel/lib/python3/dist-packages/piksi_rtk_msgs")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/pkgconfig" TYPE FILE FILES "/home/cholito/catkin_ws/build/ethz_piksi_ros/piksi_rtk_msgs/catkin_generated/installspace/piksi_rtk_msgs.pc")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/share/piksi_rtk_msgs/cmake" TYPE FILE FILES "/home/cholito/catkin_ws/build/ethz_piksi_ros/piksi_rtk_msgs/catkin_generated/installspace/piksi_rtk_msgs-msg-extras.cmake")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/share/piksi_rtk_msgs/cmake" TYPE FILE FILES
    "/home/cholito/catkin_ws/build/ethz_piksi_ros/piksi_rtk_msgs/catkin_generated/installspace/piksi_rtk_msgsConfig.cmake"
    "/home/cholito/catkin_ws/build/ethz_piksi_ros/piksi_rtk_msgs/catkin_generated/installspace/piksi_rtk_msgsConfig-version.cmake"
    )
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/share/piksi_rtk_msgs" TYPE FILE FILES "/home/cholito/catkin_ws/src/ethz_piksi_ros/piksi_rtk_msgs/package.xml")
endif()

