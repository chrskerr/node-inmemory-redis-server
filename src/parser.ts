

export default function parseData ( data: string ): ( string | number )[][] {
	const chunks: ( string | number )[] = [];
	console.log( data );

	for ( let i = 0; i < data.length; i++ ) {
		const char = data[ i ];
		if ( char === "*" || char === "%" ) {
			const j = findNext( data, i, "\r" );
			if ( j !== -1 ) chunks.push( data.slice( i, j ));

			i = j;

		} else if ( char === "$" ) {
			let length= 0, 
				offset= 0;

			const j = findNext( data, i, "\r" );

			length = Number( data.slice( i + 1, j ));
			offset = j + 2;

			chunks.push( data.slice( offset, offset + length ));

			i = offset + length;

		} else if ( char === "+" ) {
			const j = findNext( data, i, "\r" );
			chunks.push( data.slice( i + 1, j ));

			i = j;

		} else if ( char === ":" ) {
			const j = findNext( data, i, "\r" );
			chunks.push( Number( data.slice( i + 1, j )));

			i = j;

		} 
	}

	const commands: ( string | number )[][] = [];

	for ( let i = 0; i < chunks.length; i++ ) {
		const curr = chunks[ i ];

		if ( typeof curr === "string" &&  curr.startsWith( "*" )) {
			const len = Number( curr.replace( "*", "" ));
				
			const command = chunks.slice( i + 1, i + 1 + len );
			commands.push( command );

		}
	}

	if ( commands.length === 0 ) commands.push( chunks );

	console.log( chunks );
	console.log( commands );

	return commands;
}



function findNext ( string: string, curr: number, target: string ): number {
	for ( let i = curr + 1; i < string.length; i ++ ) {
		if ( string[ i ] === target ) return i;
	}
	throw new Error( "RESPFormatError" );
}
