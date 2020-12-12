/** @format */

// /** @format */

// import grpc from 'grpc';

// export default class BackendCommunication {
// 	async sayHello() {
// 		console.log('Hello 2+2 is 4!');
// 		let proto = grpc.load(`./message.proto`).message;
// 		//@ts-ignore
// 		var client = new proto.Greeter(
// 			'localhost:50051',
// 			grpc.credentials.createInsecure()
// 		);
// 		client.sayHello({
// 			name: 'Philly',
// 		});
// 	}
// }
