
/* eslint-disable no-undef */

import parseData from "./parser";

test( "parse simple string: OK", () => {
	expect( parseData( "+OK\r\n" )).toStrictEqual([ "OK" ]);
});

test( "parse simple string: HEY", () => {
	expect( parseData( "+HEY\r\n" )).toStrictEqual([ "HEY" ]);
});

test( "parse integer: 1", () => {
	expect( parseData( ":1\r\n" )).toStrictEqual([ 1 ]);
});

test( "parse integer: 25862824", () => {
	expect( parseData( ":25862824\r\n" )).toStrictEqual([ 25862824 ]);
});

test( "parse bulk string: HEY", () => {
	expect( parseData( "$2\r\nOK\r\n" )).toStrictEqual([ "OK" ]);
});

test( "parse bulk string: longpa$$word", () => {
	expect( parseData( "$12\r\nlongpa$$word\r\n" )).toStrictEqual([ "longpa$$word" ]);
});

test( "parse array: [ 'ECHO', 'hey' ]", () => {
	expect( parseData( "*2\r\n$4\r\nECHO\r\n$3\r\nhey\r\n" )).toStrictEqual([ "ECHO", "hey" ]);
});

