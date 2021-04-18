

const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
var err = new Error('Not found');
/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      console.log(error);
      next(error);
    }
  }
}

/* GET listing of Books. */
router.get('/', asyncHandler(async (req, res) => {
  const Books = await Book.findAll({ order: [["createdAt", "DESC"]] });
  //console.log(Books);
  res.render("index", { Books, title: "Sequelize-It!" });
}));


router.get('/new', (req, res) => {
	res.render('new-book', { book: {}, title: 'New Book' });
});

/* POST create Book. */
router.post('/new', asyncHandler(async (req, res) => {

  try {
    const book = await Book.create(req.body);
    res.redirect("/");
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render("new-book", { book, errors: error.errors, title: "New Book" })
    } else {
      throw error;
    }  
  }
}));


/* GET individual Book. */
router.get("/:id", asyncHandler(async (req, res,next) => {
  console.log('prelookup')
  
  const book = await Book.findByPk(req.params.id);
  console.log('postlookup')
  if(book) {
    res.render("./update-book", { book,  title: "Edit Book" });  
  } else {

    err.status = 404;
    return next(err);
  }
})); 

/* Update a Book. */
router.post('/:id/edit', asyncHandler(async (req, res) => {
  let book;
  try {
    //console.log("req.params.id: " + req.params.id);
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect("/"); 
    } else {

      err.status = 404;
      return next(err);
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render("./update-book", { book, errors: error.errors, title: "Edit Book" })

    } else {
      throw error;
    }
  }
}));

/* Delete Book form. */
router.get("/:id/delete", asyncHandler(async (req, res) => {
  let book;
  book = await Book.findByPk(req.params.id);
  if(book) {
    res.render("delete", { book, title: "Delete Book" });
  } else {
    err.status = 404;
    return next(err);
  }
}));

/* Delete individual Book. */
router.post('/:id/delete', asyncHandler(async (req ,res) => {
  let book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/");
  } else {
    err.status = 404;
    return next(err);
  }
}));

module.exports = router;
