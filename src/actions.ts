

let storageObject: {[k: string]: { value: string | number, set_at?: number }} = {};

export function handleCommand ( command: string, instructions: ( string | number )[]): string {
	let res = `-ERR unknown command '${ command }'\r\n`;
	
	if ( command === "SET" ) res = handleSet( instructions );
	else if ( command === "GET" ) res = handleGet( instructions );
	else if ( command === "DELETE" ) res = handleDelete( instructions );
	else if ( command === "FLUSH" ) res = handleFlush();
	else if ( command === "MGET" ) res = handleMultipleGet( instructions );
	else if ( command === "MSET" ) res = handleMultipleSet( instructions );
	
	return res;
}


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
