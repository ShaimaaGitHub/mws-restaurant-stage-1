module.exports=function(grunt) {
	
  /*    grunt.registerTask("default","a pointless task",function(){
          grunt.log.write("This grunt task is pointless");

      });  */

 grunt.initConfig({
  responsive_images: {
    dev: {
      files: [{
        expand: true,
        src: ['src/{jpg,gif,png}'],
        cwd: 'src/',
        dest: 'dest/'
      }]
    }
  }})
  grunt.registerTask("default","first task",[responsive-images]);
};     

 