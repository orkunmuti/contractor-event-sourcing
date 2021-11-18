let chai = require('chai');
let expect = chai.expect;
let assert = chai.assert;
var request = require('request')
chai.use(require('chai-things'));
let chaiHttp = require('chai-http');
let server = require('../index');

const isToday = (date) => {
    if (date == null || !Date.parse(new Date(date))) return false;
    const today = new Date()
    date = new Date(date);
    return date.getDate() == today.getDate() &&
        date.getMonth() == today.getMonth() &&
        date.getFullYear() == today.getFullYear()
}

// Assertion Style
chai.should();
chai.expect();

chai.use(chaiHttp);

describe('Contracts API', () => {
    let testBody = null;

    before(function (done) {
        request.post('http://localhost:5000/contracts/createContract', (err, response) => {
            testBody = response.body;
        })
        done();
    });


    // Test GET contracts
    describe('GET /contracts', () => {
        it('It should get paginated contracts', (done) => {
            chai
                .request(server)
                .get('/contracts?page=1&limit=20')
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.data.should.be.a('array');
                    expect(response.body.data).to.have.lengthOf(20);
                    done();
                });
        });
    })

    //Test Create Contract
    describe('POST /contracts/createContract', () => {
        it('It should create contract and return the result', (done) => {
            chai
                .request(server)
                .post('/contracts/createContract')
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    assert(response.body.premium === 100)
                    assert(response.body.terminationDate == null)
                    expect(isToday(response.body.startDate)).to.be.true
                    done();
                });
        });
    });

    //Test Terminate Contract with invalid body
    describe('POST /contracts/terminateContract', () => {
        it('It should fail and give invalid body error', (done) => {
            chai
                .request(server)
                .post('/contracts/terminateContract')
                .end((err, response) => {
                    response.should.have.status(404);
                    assert(response.body.message === 'Invalid body.')
                    done();
                });
        });
    })

    // Test Terminate Contract with valid body
    describe('POST /contracts/terminateContract', () => {
        it('It should terminate contract and return the result', (done) => {
            let { contractId, startDate, premium, terminationDate } = JSON.parse(testBody);
            chai
                .request(server)
                .post('/contracts/terminateContract')
                .set('content-type', 'application/json')
                .send({
                    contractId,
                    startDate,
                    premium,
                    terminationDate
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    expect(response.body.contractId === contractId)
                    expect(isToday(response.body.terminationDate)).to.be.true
                    done();
                });
        });
    })
});