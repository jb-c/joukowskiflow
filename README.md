# Joukowski Airfoil Flows
Airflow simulation around Joukowski airfoils, made in JavaScript.
![alt text](https://github.com/jb-c/joukowskiflow/blob/master/media/pic1.jpg "Screenshot of flow")

Live Demo: https://joukowskiflow.000webhostapp.com/
(Only tested on chrome for windows 10 desktop)


## The Process Involved
Firstly we simulate irrotational, incompressible flow around a cylinder [Wiki](https://en.wikipedia.org/wiki/Potential_flow_around_a_circular_cylinder)

![alt text](https://github.com/jb-c/joukowskiflow/blob/master/media/pic2.jpg "Flow Round A Cylinder")

Then we apply the [Joukowski transformation](https://en.wikipedia.org/wiki/Joukowsky_transform) to the flow roiund a cylinder, and with a little calculation we get flow round a flat plate!

![alt text](https://github.com/jb-c/joukowskiflow/blob/master/media/pic3.jpg "Flow Round A Flat Plate")

Then moving the cylinder in the original plane and applying the transformation again, produces an airfoil shape and corresponding flow!

![alt text](https://github.com/jb-c/joukowskiflow/blob/master/media/pic4.jpg "Flow Round An Airfoil")

## How This Project Works
This project has undergone a few different main design methodologies. After experimenting with a pre-calculated vector field hash table and the use of line integral convolution techniques, neither of which offered the desired performance, I settled on the following method.

1. Update particle positions. For each particle, compute its position a small time-step later using a 4th order [Runge–Kutta method](https://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods) and save this in an array.
2. Map the particle coordinates to pixel coordinates, so we can draw the particles easily.
3. Create a 'pixel map' a 2D boolean array, indicating if each pixel contains a particle or not.
4. Draw the particles to the screen, fading the background.
5. Draw the cylinder/airfoil shape on top of the velocity field.

In step 1, we lookup the velocity value at a number of positions. This allows for real time paramiter updates as the velociy field is not pre-sampled.

Most of the calculations run on the GPU, with help from [GPU.js](https://gpu.rocks/)
