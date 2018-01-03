var ReferenceOutput = require('../models/referenceOutput');
var mongoose = require('mongoose');
mongoose.connect('mongodb://admin:admin@ds133627.mlab.com:33627/kcoin_db');
var referenceOutputs = [
	new ReferenceOutput({//Minh
		referencedOutputHash: 'd6fd4a290c22190d6c414f51c96a7eb800c1705e83d3931861f562935c1f831c',
		referencedOutputIndex: 2,
		address: '768559b0242d7203a1b8c3a0d034841866822c487defc7fa6e359d29c27742f3',
		money: 10000
	}),
	new ReferenceOutput({//Liễu
		referencedOutputHash: '6d97526dc919784ffabefd21adfffe56ab2384e43e41b085a54f5fd39ee6654c',
		referencedOutputIndex: 15,
		address: 'a74c89375469ce553872a753ef6e330985eec6f1ada41a9be69c246db1ad08de',
		money: 10000
	}),
	new ReferenceOutput({//My
		referencedOutputHash: '231950d7087e75d7a7fa045187baa04254896be4e9381ddc105ca23dda643c24',
		referencedOutputIndex: 8,
		address: '77d231e59c95d3c4bad46c4896964427649f77321c38b59642d2ad4c022e3cb5',
		money: 10000
	}),
	new ReferenceOutput({
		referencedOutputHash: 'a9c39003d7061acf574a923221a80ed3df2d8578363ff56156728103f3f9cc38',
		referencedOutputIndex: 0,
		address: '768559b0242d7203a1b8c3a0d034841866822c487defc7fa6e359d29c27742f3',
		money: 9999
	}),
	new ReferenceOutput({
		referencedOutputHash: 'a9c39003d7061acf574a923221a80ed3df2d8578363ff56156728103f3f9cc38',
		referencedOutputIndex: 1,
		address: 'a74c89375469ce553872a753ef6e330985eec6f1ada41a9be69c246db1ad08de',
		money: 1
	})
];
var done=0;
for (var i=0;i<referenceOutputs.length;i++){
	referenceOutputs[i].save(function(err,result){
		done++;
		if (done == referenceOutputs.length){
			exit();
		}
	});
}
function exit(){
	mongoose.disconnect();
}
module.exports = referenceOutputs;
