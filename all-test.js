
const tester = require('supertest');
const expect = require("chai").expect;
const testSetup = require('./test-setup');

describe("Authentication with 'POST' request", () => {
  var request;
  
  beforeEach(() => {
    request = tester(testSetup.testUrl)
      .post('/groovy/submit')
      //The code value is to satisfy request paremeters constraint, 
      //and to avoide Error 500 when the request with identical code is sent more than once (Bug 001)
      .send({ code: "println(new Date())"}); 
  });

  it("should works for existing user and correct password (U1,P1)", async () => {
    const response = await request
    .auth(testSetup.user1, testSetup.user1Password)
    expect(response.status).to.not.equal(401);     
    console.info('Status: ' + response.status);     
  });

  it("should not work when called anonymous (U empty, P empty)", async () => {
    const response = await request;
    expect(response.status).to.equal(401); 
    console.info('Status: ' + response.status);
  });

  it("shoud not work when called with invalid password (U1, P invalid)", async () => {
    const response = await request
    .auth(testSetup.user1, 'invalidPasssword');
    expect(response.status).to.equal(401); 
    console.info('Status: ' + response.status);  
  });

  it("shoud not work when called with empty password (U1, P empty)", async () => {
    const response = await request
    .auth(testSetup.user1, '');
    expect(response.status).to.equal(401); 
    console.info('Status: ' + response.status);  
  });

  it("shoud not work when called with other users password (U1, P2)", async () => {
    const response = await request
    .auth(testSetup.user1, testSetup.user2Password);
    expect(response.status).to.equal(401);   
    console.info('Status: ' + response.status);
  });

  it("shoud not work when called with empty username (U empty, P1)", async () => {
    const response = await request
    .auth('', testSetup.user1Password);
    expect(response.status).to.equal(401);    
    console.info('Status: ' + response.status);
  });

});

describe("Authentication with 'GET' request", () => {
  var request;
  var responseId;

  beforeEach(() => {
    request = tester(testSetup.testUrl);
    
    x = new Date().getTime();
    y = new Date().getTime();
    testCode = '' +  x + ' + ' + y; //testCode needs to be changed for every new request to avoid Error 500 (Bug 001)
  });
  it("result should be available to the user who submited the request", async () => {
    request = tester(testSetup.testUrl);
    var response = await request
    .post('/groovy/submit')
    .auth(testSetup.user1, testSetup.user1Password)
    .send({code: testCode})
    responseId = response.body.id;
    expect(response.status).to.equal(200)

    response = await request
    .get('/groovy/status?id=' + responseId)
    .auth(testSetup.user1, testSetup.user1Password)  
    expect(response.status).to.equal(200);
    console.info('Status: ' + response.status);
    });

  it("result should not be available to anonymus user", async () => {
    request = tester(testSetup.testUrl);
    var response = await request
    .post('/groovy/submit')
    .auth(testSetup.user1, testSetup.user1Password)
    .send({code: testCode})
    responseId = response.body.id;
    expect(response.status).to.equal(200)
    
    response = await request
    .get('/groovy/status?id=' + responseId)      
    expect(response.status).to.equal(401);
    console.info('Status: ' + response.status);
    });

  it("result should not be available to users other then the one who submitted the request", async () => {
    request = tester(testSetup.testUrl);
    var response = await request
    .post('/groovy/submit')
    .auth(testSetup.user1, testSetup.user1Password)
    .send({code: testCode})
    responseId = response.body.id;
    expect(response.status).to.equal(200)
        
    response = await request
    .get('/groovy/status?id=' + responseId)
    .auth(testSetup.user2, testSetup.user2Password)    
    expect(response.status).to.equal(401);
    console.info('Status: ' + response.status);
    });

  it("result should not be available to an user with invalid password", async () => {
    request = tester(testSetup.testUrl);
    var response = await request
    .post('/groovy/submit')
    .auth(testSetup.user1, testSetup.user1Password)
    .send({code: testCode})
    responseId = response.body.id;
    expect(response.status).to.equal(200)
            
    response = await request
    .get('/groovy/status?id=' + responseId)
    .auth(testSetup.user1, 'invalidPassword')    
    expect(response.status).to.equal(401);
    console.info('Status: ' + response.status);
    });
    
  it("result should not be available to an user with empty password", async () => {
    request = tester(testSetup.testUrl);
    var response = await request
    .post('/groovy/submit')
    .auth(testSetup.user1, testSetup.user1Password)
    .send({code: testCode})
    responseId = response.body.id;
    expect(response.status).to.equal(200)
              
    response = await request
    .get('/groovy/status?id=' + responseId)
    .auth(testSetup.user1, '')    
    expect(response.status).to.equal(401);
    console.info('Status: ' + response.status);
    });
      
  it("result should not be available to an user using other users password", async () => {
    request = tester(testSetup.testUrl);
    var response = await request
    .post('/groovy/submit')
    .auth(testSetup.user1, testSetup.user1Password)
    .send({code: testCode})
    responseId = response.body.id;
    expect(response.status).to.equal(200)
           
    response = await request
    .get('/groovy/status?id=' + responseId)
    .auth(testSetup.user1, testSetup.user2Password)    
    expect(response.status).to.equal(401);
    console.info('Status: ' + response.status);
    });
    
  it("result should not be available to an user with empty user name", async () => {
    request = tester(testSetup.testUrl);
    var response = await request
    .post('/groovy/submit')
    .auth(testSetup.user1, testSetup.user1Password)
    .send({code: testCode})
    responseId = response.body.id;
    expect(response.status).to.equal(200)
           
    response = await request
    .get('/groovy/status?id=' + response.id)
    .auth('', testSetup.user1Password)    
    expect(response.status).to.equal(401);
    console.info('Status: ' + response.status);
    });  
  });    
describe("Result tests", () => {
  var request;
  var responseId;
  var x;
  var y;

  beforeEach(() => {
    request = tester(testSetup.testUrl);
    
    x = new Date().getTime();
    y = new Date().getTime();
    z = new Date().getTime();
    q = new Date().getTime();
    testCode = '' +  x + ' + ' + y; //needed to test correctness of the code execution by the service
  });

  it("should produce correct result of a code execution", async () => {
   
    var response = await request
    .post('/groovy/submit')
    .auth(testSetup.user1, testSetup.user1Password)
    .send({code: testCode});

    responseId = response.body.id;
    expect(response.status).to.equal(200);
    expect(responseId).to.not.be.empty;

  //The loop is to ensure that the status COMPLETED is reached, and result of groovy code execution is present
    var submitStatus = 'IN_PROGRESS';
    while (submitStatus == 'IN_PROGRESS' || submitStatus == 'PENDING') {
      response = await tester(testSetup.testUrl)
        .get('/groovy/status?id=' + responseId)
        .auth(testSetup.user1, testSetup.user1Password);
      submitStatus = response.body.status;
    }    

    expect(response.status).to.equal(200); 
    expect(response.body.result).to.equal('' + (x + y));        
  })

  it("should correctly handle parallel execution", async () => {
    
    var asyncResponse1 = request       
    .post('/groovy/submit')
    .auth(testSetup.user1, testSetup.user1Password)
    .send({ code: testCode});
   
    testCode2 = '' +  x + ' + ' + y + '+' + z;

    var asyncResponse2 = request
    .post('/groovy/submit')
    .auth(testSetup.user1, testSetup.user1Password)
    .send({ code: testCode2});
    
    testCode3 = '' +  x + ' + ' + y + '+' + z + '+' + q;

    var asyncResponse3 = request
    .post('/groovy/submit')
    .auth(testSetup.user1, testSetup.user1Password)
    .send({ code: testCode3});    

    var response3 = await asyncResponse3;
    expect(response3.status).to.equal(200);
   
    var response1 = await asyncResponse1;
    expect(response1.status).to.equal(200);
    
    var response2 = await asyncResponse2;
    expect(response2.status).to.equal(200);
    
    responseId1 = response1.body.id;
    responseId2 = response2.body.id;
    responseId3 = response3.body.id;

    asyncResponse1 = tester(testSetup.testUrl)    
    .get('/groovy/status?id=' + responseId1)   
    .auth(testSetup.user1, testSetup.user1Password);

    asyncResponse2 = tester(testSetup.testUrl)
    .get('/groovy/status?id=' + responseId2)
    .auth(testSetup.user2, testSetup.user2Password);

    asyncResponse3 = tester(testSetup.testUrl)
    .get('/groovy/status?id=' + responseId3)
    .auth(testSetup.user3, testSetup.user3Password);

    response3 = await asyncResponse3;
    response1 = await asyncResponse1;    
    response2 = await asyncResponse2;

    expect(response1.status).to.equal(200);
    expect(response2.status).to.equal(200);
    expect(response3.status).to.equal(200); 
    
    expect(response1.body.status).to.equal('COMPLETED');
    expect(response2.body.status).to.equal('COMPLETED');
    expect(response3.body.status).to.equal('COMPLETED');    
  }); 

});