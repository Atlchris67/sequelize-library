const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
}

/* GET listing of Books. */
router.get('/', asyncHandler(async (req, res) => {
  const Books = await Book.findAll({ order: [["createdAt", "DESC"]] });
  console.log(Books);
  res.render("books/index", { Books, title: "Sequelize-It!" });
}));


router.get('/new', (req, res) => {
	res.render('./books/new-book', { book: {}, title: 'New Book' });
});



/* POST create Book. */
router.post('/new', asyncHandler(async (req, res) => {

  try {
    const book = await Book.create(req.body);
    res.redirect("/books");
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render("books/new-book", { book, errors: error.errors, title: "New Book" })
    } else {
      throw error;
    }  
  }
}));

/* GET individual Book. */
router.get("/:id", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render("./books/update-book", { book,  title: "Edit Book" });  
  } else {
    res.sendStatus(404);
  }
})); 

/* Update a Book. */
router.post('/:id/edit', asyncHandler(async (req, res) => {
  let book;
  try {
    console.log("req.params.id: " + req.params.id);
    book = await Book.findByPk(req.params.id);
    console.log(" book id: " + JSON.stringify(book));
    console.log("req.body: " + JSON.stringify(req.body))
    if(book) {
      await book.update(req.body);
      res.redirect("/Books"); 
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      console.log("error.errors: " + JSON.stringify(error.errors))
      res.render("./books/update-book", { book, errors: error.errors, title: "Edit Book" })

    } else {
      throw error;
    }
  }
}));

/* Delete Book form. */
router.get("/:id/delete", asyncHandler(async (req, res) => {
  console.log("req.params.id: " + req.params.id);
  let book = await Book.findByPk(req.params.id);
  if(book) {
    res.render("./delete", { book, title: "Delete Book" });
  } else {
    res.sendStatus(404);
  }
}));

/* Delete individual Book. */
router.post('/:id/delete', asyncHandler(async (req ,res) => {
  console.log("req.params.id: " + req.params.id);
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/");
  } else {
    res.sendStatus(404);
  }
}));

module.exports = router;