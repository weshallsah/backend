

const asyncHandler = (reqHandler) => {
    (req, res, next) => {
        Promise.resolve(reqHandler(req, res, next)).catch((err) => next(err));
    }
};

export { asyncHandler };


// const as= (fn)=>{
//     async (req,res,next)=>{
//         try{
//             await fn(req,res,next);
//         } catch(err){
//             console.log(`${err.code} :${err.message}`);
//             res.status(err.code || 500).json({
//                 success: false,
//                 message: err.message
//             });
//         }
//     };
// };