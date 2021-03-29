// const express = require('express');
// const router = express.Router();

// /* GET home page. */
// router.get('/', (req, res, next) => {
//   res.redirect("/books")
// });

// module.exports = router;

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

// /* Edit Book form. */
// router.get("/:id/edit", asyncHandler(async(req, res) => {
//   const Book = await Book.findByPk(req.params.id);
//   if(Book) {
//     res.render("Books/edit", { Book, title: "Edit Book" });      
//   } else {
//     res.sendStatus(404);
//   }
// }));

/* GET individual Book. */
router.get("/:id", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render("./update-book", { book,  title: "Edit Book" });  
  } else {
    
    res.render("./page-not-found", { book,  title: `Get Book ${req.params.id}` }); 
 
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
      res.redirect("/"); 
    } else {
      res.render("./page-not-found", { book,  title: `Edit Book ${req.params.id}` });
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      console.log("error.errors: " + JSON.stringify(error.errors))
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
    res.render("./page-not-found", { book,  title: `Delete Book ${req.params.id}` });
  }
}));

/* Delete individual Book. */
router.post('/:id/delete', asyncHandler(async (req ,res) => {
  let book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/");
  } else {
    res.sendStatus(404);
  }
}));

module.exports = router;
