execute_process(COMMAND "/home/cholito/catkin_ws/build/ethz_piksi_ros/piksi_rtk_kml/catkin_generated/python_distutils_install.sh" RESULT_VARIABLE res)

if(NOT res EQUAL 0)
  message(FATAL_ERROR "execute_process(/home/cholito/catkin_ws/build/ethz_piksi_ros/piksi_rtk_kml/catkin_generated/python_distutils_install.sh) returned error code ")
endif()
