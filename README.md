# Object-Detection-PaaS
A server which provide object detection cloud service

## Usage
- change directory to pix2pix-PaaS

	```cd GAN-PaaS```

- install nodejs dependency:

  ```npm install```

- run mongo db docker container
  
  ```docker run -name mongo -p 27017:27017 -d mongo```
  
- clone pix2pix-tensorflow
	
	```git clone https://github.com/affinelayer/pix2pix-tensorflow.git```
  
- set a secret key for session
	
	```vim secret.js```
	
	The content of this file should look like the following image. You can change variable "str" to any string.
	
	![](https://i.imgur.com/2dKKdQ6.png)

- start server:

  ```node app.js```

- browse the website at http://localhost:3000/
