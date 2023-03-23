const express = require('express')
const app = express()
const cors = require('cors')
const dotenv = require('dotenv')
const JWT = require('jsonwebtoken')
const path = require('path')

dotenv.config()
const PORT = process.env.PORT || 4500

let bodyParser = require('body-parser');

require('./db/congif')

const hashPassword = require('./helper/authHelper')
const { compare } = require('bcrypt')
const Movies = require('./models/Movies')
const User = require('./models/User')
const Category = require('./models/Category')
const Hollywood = require('./models/Hollywood')
const Watched = require('./models/Watched')


app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())



// SIGN UP OR REGISTER APi

app.post('/register', async (req, res) => {
    const { name, email, password, cpassword, mobile } = req.body;
    if (!email, !name, !password, !cpassword, !mobile) {
        return res.status(500).send({
            success: false,
            message: 'Please Enter Correct Details',

        })
    }


    try {

        let existingUser = await User.findOne({ email, mobile });

        if (existingUser) {
            return res.status(200).send({
                success: false,
                message: "User Already Exists"
            });
        }

        const hashedPassword = await hashPassword(password)
        const user = await new User({
            name, email, password: hashedPassword, mobile, cpassword: hashedPassword
        })
        await user.save();
        res.status(200).send({
            success: true,
            message: "Registered Successfully",
            user
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Error while registration",
            error,
        })
    }
})


// LOGIN

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if user already exists
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not registered or Invalid",

            })
        }
        if (!password || !email) {
            return res.status(404).send({
                success: false,
                message: "Invalid email or password",

            })
        }

        const matchPassword = await compare(password, user.password)
        if (!matchPassword) {
            return res.status(404).send({
                success: false,
                message: "Invalid email or password",
            })
        }

        // generate token 

        const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

        res.status(200).send({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                isAdmin: user.isAdmin
            },
            token
        })
    } catch (error) {
        res.status(400).send({
            success: false,
            message: "Invalid Credentials",
            error,
        })
    }
})

// UPDATE PROFILE


app.put('/update/profile/:id', async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body
        const user = await User.findOne({ _id: req.params.id })
        if (password && password.length > 6) {
            return res.json({ error: "Password required and more than 6 characters" })
        }

        const hashedPassword = password ? await hashPassword(password) : undefined
        const updateUser = await User.findByIdAndUpdate({ _id: req.params.id }, {
            name: name || user.name,
            email: email || user.email,
            mobile: mobile || user.mobile,
            password: hashedPassword || user.password,
        },
            { new: true })

        res.status(200).send({
            success: true,
            message: "User Updated Successfully",
            updateUser
        })
        console.log(user)

    } catch (error) {
        console.log(error)
        res.status(500).send({
            error,
            success: false,
        })
    }
})

// SHOW DASHBOARD AFTER AUTHENTICATE USER

app.get('/user/auth', async (req, res) => {
    res.status(200).send({ ok: true })
})

// CHECK ADMIN AND ACCESS ONLY ADMIN

app.get('/admin/auth/:id', async (req, res, next) => {
    let id = req.params.id
    // console.log(id)
    try {

        let adminId = await User.findOne({ _id: req.params.id })
        // console.log(adminId)
        console.log(adminId.isAdmin)
        if (adminId.isAdmin) {
            res.status(200).send({
                ok: true,
            })
        }
        else {
            res.status(500).send({ ok: false })
        }

    } catch (error) {
        console.log(error)
        res.status(500).send({ error })
    }

})

// GET ALL USER

app.get('/users', async (req, res) => {
    try {
        let user = await User.find();
        if (user) {
            res.status(200).send({
                success: true,
                message: "All users fetched successfully.",
                user

            })
        }
    
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success: false,
            error
        })
    }
})


app.get('/movies', async (req, res) => {
    try {
        let movies = await Movies.find({})
        if (movies.length > 0) {
            res.status(200).send({
                success: true,
                message: 'Movie reloading',
                movies
            })
        }


    } catch (error) {
        console.error(error)
        res.status(500).send({
            success: false,
            message: "No movies were found",
            error
        })
    }
})


app.get('/hollywood', async (req, res) => {
    try {
        let movies = await Hollywood.findOne()
        if (movies) {
            res.status(200).send({
                success: true,
                message: 'Movie reloading',
                movies
            })
        }

        
    } catch (error) {
        console.error(error)
        res.status(500).send({
            success: false,
            message: "No movies were found",
            error
        })
    }
})


// CREATE CATEGORY

app.post('/category', async (req, res) => {
    let { name } = req.body;

    try {
        console.log(name);
        let existingCat = await Category.findOne({ name })

        if (existingCat) {
            return res.status(200).send({
                success: false,
                message: 'Category Already Exists'
            })
        }

        const newCat = await new Category({ name })

        await newCat.save()
        res.status(201).send({
            success: true,
            message: 'Category created successfully',
            newCat
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error
        })
    }
})

// GET ALL CATEGORIES

app.get('/category', async (req, res) => {
    try {
        const category = await Category.find({})
        res.status(200).send({
            success: true,
            message: "All categories",
            category
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            error,
            message: "Error getting categories"
        })
    }
})


// GET SINGLE CATEGORY

app.get('/category/:id', async (req, res) => {
    try {
        const category = await Category.find({ _id: req.params.id })
        // console.log("CAT"+category)
        const movies = await Movies.find({ category }).populate('category')
        res.status(200).send({
            success: true,
            category,
            movies
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false
        })
    }

})


//  UPLOAD NEW MOVIE

app.post('/movies', async (req, res) => {

    let { title, movie_description, category, img, year, subscription } = req.body
    if (!title || !category || !img || !year || !subscription || !movie_description) {
        return res.status(400).send({
            success: false,
            error: 'Please fill all required fields'
        })
    }


    try {
        let movie = await new Movies({
            title, movie_description, img, category, year, subscription
        })

        await movie.save()
        if (movie) {
            return res.status(201).send({
                success: true,
                message: "New movie uploaded successfully",
                movie
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Something went wrong",
            error
        })
    }
})

// SINGLE MOVIE DETAIL 

app.get('/movie/detail/:id', async (req, res) => {
    try {
        const movie = await Movies.find({ _id: req.params.id })
        if (movie) {
            res.status(200).send({
                success: true,
                movie,
                message: "Successfully"
            })
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error
        })
    }
})


// SEARCH MOVIE

app.get('/search/:key', async (req, res) => {
    try {
        const keyword = req.params.key
        let data = await Movies.find({
            $or: [
                { title: { $regex: keyword, $options: 'i' } },
                { movie_description: { $regex: keyword, $options: 'i' } },
            ]
        })

        res.send(data)
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error
        })
    }
})


app.post('/watched', async (req, res) => {
    try {
        let {user, movie} = req.body;
        let watch = await new Watched({
            user,
            movie
        })

        await watch.save()
        res.status(200).send({
            success: true,
            watch
        })
    } 
    catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error
        })
    }
})


app.get('/watched', async (req, res) => {
    
})





app.listen(PORT)