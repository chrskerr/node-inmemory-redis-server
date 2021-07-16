
import net from "net";

const user = "chris";
const password = "password";

let storageObject: {[k: string]: { value: string | number, set_at?: number }} = {};

const server = net.createServer();

server.on( "error", ( err ) => {
	console.error( err );
	throw err;
});
  
server.on( "connection", socket => {
	let isAuthenticated = false;

	socket.on( "data", data => {
		const [ command, ...instructions ] = parseData( data.toString().trim());
		const upperCommand = typeof command === "string" ? command.toUpperCase() : undefined;

		let res = `-ERR unknown command '${ command }'\r\n`;
		if ( upperCommand === "AUTH" ) {
			res = handleAuth( instructions );
			if ( res === "+OK\r\n" ) isAuthenticated = true;
		}

		if ( !isAuthenticated ) {
			socket.write( "-ERR not authorised\r\n" );
			return socket.destroy();
		}
		else {
			if ( upperCommand === "SET" ) res = handleSet( instructions );
			else if ( upperCommand === "GET" ) res = handleGet( instructions );
			else if ( upperCommand === "DELETE" ) res = handleDelete( instructions );
			else if ( upperCommand === "FLUSH" ) res = handleFlush();
			else if ( upperCommand === "MGET" ) res = handleMultipleGet( instructions );
			else if ( upperCommand === "MSET" ) res = handleMultipleSet( instructions );
		}

		socket.write( res );
	});

});

server.listen( 6379, () => {
	console.log( "opened server on", server.address());
});

const parseData = ( data: string ): ( string | number )[] => {
	const chunked: ( string | number )[] = [];
	const parsed: ( string | number )[] = [];

	for ( let i = 0; i < data.length; i++ ) {
		const char = data[ i ];
		if ( char === "*" || char === "%" ) {
			const j = findNext( data, i, "\r" );
			if ( j !== -1 ) chunked.push( data.slice( i, j ));

		} else if ( char === "$" ) {
			let length= 0, 
				offset= 0;

			const j = findNext( data, i, "\r" );

			length = Number( data.slice( i + 1, j ));
			offset = j + 2;

			chunked.push( data.slice( offset, offset + length ));
		} else if ( char === "+" ) {
			const j = findNext( data, i, "\r" );
			chunked.push( data.slice( i, j ));

		} else if ( char === ":" ) {
			const j = findNext( data, i, "\r" );
			chunked.push( Number( data.slice( i, j )));
		} 
	}

	for ( let i = 0; i < chunked.length; i++ ) {
		const curr = chunked[ i ];

		if ( typeof curr === "string" ) {
			if ( curr.startsWith( "*" )) {
				const len = Number( curr.replace( "*", "" ));

				if ( len !== chunked.length - 1 ) throw new Error( "Array length mismatch" );
			} else {
				parsed.push( curr );
			}
		} else {
			parsed.push( curr );
		}
	}

	return parsed;
};

const findNext = ( string: string, curr: number, target: string ): number => {
	for ( let i = curr + 1; i < string.length; i ++ ) {
		if ( string[ i ] === target ) return i;
	}
	return -1;
};

const handleAuth = ( instructions: ( string | number )[]) => {
	if ( instructions[ 0 ] === user && instructions[ 1 ] === password ) return "+OK\r\n";
	return "-ERR not authorised\r\n";

};

const handleSet = ( instructions: ( string | number )[]) => {
	const [ key, value ] = instructions;
	storageObject[ key ] = { value };
	return "+OK\r\n";
};

const handleGet = ( instructions: ( string | number )[]) => {
	const [ key ] = instructions;
	const value = storageObject[ key ];

	if ( !value || typeof value !== "object" ) return "$-1\r\n";
	else if ( typeof value.value === "number" ) return `:${ value.value }\r\n`;
	else return `$${ value.value.length }\r\n${ value.value }\r\n`;
};

const handleFlush = () => {
	storageObject = {};
	return "+OK\r\n";
};

const handleDelete = ( instructions: ( string | number )[]) => {
	const [ key ] = instructions;
	delete storageObject[ key ];

	return "+OK\r\n";

};

const handleMultipleSet = ( instructions: ( string | number )[]) => {
	for ( let i = 0; i < instructions.length - 1; i = i + 2 ) {
		const key = instructions[ i ];
		const value = instructions[ i + 1 ];
		if ( key && value ) storageObject[ key ] = { value };
	}

	return "+OK\r\n";

};
const handleMultipleGet = ( instructions: ( string | number )[]) => {
	const values = instructions.map( key => {
		const value = storageObject[ key ];
		if ( !value || typeof value !== "object" ) return "$-1\r\n";
		else if ( typeof value.value === "number" ) return `:${ value.value }\r\n`;
		else return `$${ value.value.length }\r\n${ value.value }\r\n`;
	});

	return `*${ values.length }\r\n${ values.join( "" ) }`;

};
