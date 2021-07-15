
import net from "net";


const server = net.createServer(( socket ) => {

	socket.on( "connect", () => {
		console.log( socket );
		console.log( socket.localAddress );
	});

	socket.on( "data", data => {
		console.log( data );

		// handle 

		socket.write( "done" );
	});
	
});

server.on( "error", ( err ) => {
	console.error( err );
	throw err;
});
  
server.listen( 6379, () => {
	console.log( "opened server on", server.address());
});
