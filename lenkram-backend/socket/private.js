
module.exports = function(io){

    io.on('connection', socket=>{

        socket.on('join chat',(params)=>{
            //console.log(params);
            socket.join(params.room1);
            socket.join(params.room2);
        })

        socket.on('start_typing', data =>{

           //console.log(data);
           io.to(data.receiver).emit('is_typing', data);

        })


        socket.on('stop_typing', data =>{

            //console.log(data);
            io.to(data.receiver).emit('has_stopped_typing', data);
 
         })
     
    });

}