
import net from "net";
import { handleCommand } from "./actions";
import parseData from "./parser";

const user = "chris";
const password = "password";

const server = net.createServer();

server.on( "error", ( err ) => {
	console.error( err );
	throw err;
});
  
server.on( "connection", socket => {
	let isAuthenticated = true;

	socket.on( "data", data => {
		const commands = parseData( data.toString().trim());
		
		for ( let i = 0; i < commands.length; i++ ) {
			const command = commands[ i ];
			const [ action, ...instructions ] = command;
			const upperAction = typeof action === "string" ? action.toUpperCase() : "";

			if ( isAuthenticated && upperAction !== "AUTH" ) {
				socket.write( handleCommand( upperAction, instructions ));

			} else if ( upperAction === "AUTH" && instructions[ 0 ] === user && instructions[ 1 ] === password ) {
				socket.write( "+OK\r\n" );
				isAuthenticated = true;

			} else {
				socket.write( "-ERR not authorised\r\n" );
				socket.destroy();

			}
		}
	});
});

server.listen( 6379, () => {
	console.log( "opened server on", server.address());
});
