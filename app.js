const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const ingredientsRouter = require('./routes/ingredients')
const recipeRouter = require('./routes/recipes')

const app = express()

const jwt = require('express-jwt')
const jwtAuthz = require('express-jwt-authz')
const jwksRsa = require('jwks-rsa')

const corsOptions = {
	origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
}

// Authentication middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
const checkJwt = jwt({
	// Dynamically provide a signing key
	// based on the kid in the header and
	// the signing keys provided by the JWKS endpoint.
	secret: jwksRsa.expressJwtSecret({
		cache: true,
		rateLimit: true,
		jwksRequestsPerMinute: 5,
		jwksUri: 'https://mealprepr.auth0.com/.well-known/jwks.json',
	}),

	// Validate the audience and the issuer.
	audience: 'https://stark-beach-91865.herokuapp.com/',
	issuer: 'https://mealprepr.auth0.com/',
	algorithms: ['RS256'],
})

const checkAccess = jwtAuthz(['access:user', 'access:admin'])

app.use(logger('dev'))
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/ingredients', ingredientsRouter)
app.use('/recipes', checkJwt, recipeRouter)

module.exports = app
