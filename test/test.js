const { expect } = require("chai")
const request = require("supertest")
const app = require("../server")

describe("URL Shortening Service", () => {
  it("should retrieve short URLs", (done) => {
    request(app).get("/api").expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body).to.have.property("shortUrls").to.be.an("array")
        done()
      })
  })

  it("should create a short URL", (done) => {
    const validURL = "https://example.com"
    request(app).post("/api/shortUrls").send({ fullUrl: validURL })// have noe done token implemntation yet
      .expect(302)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it("should redirect to the original URL for a valid short URL", (done) => {
    const validShortURL = "owFDBr"

    request(app).get(`/api/${validShortURL}`).expect(302) 
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it("should return a 404 status for an invalid short URL", (done) => {
    const invalidShortURL = "https://example.com"
    request(app).get(`/${invalidShortURL}`).expect(404)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })
})
