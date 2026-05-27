import multer from "multer"


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    const uniqName=Date.now()+"-"+file.originalname
    cb(null, uniqName)
  }
})

 export const upload = multer({ storage
  })