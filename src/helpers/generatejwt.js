import jwt from 'jsonwebtoken'
const { sign } = jwt



const generateJWT = (userexist = '') => {

  return new Promise((resolve, reject) => {
    
    const payload = {id: userexist.id, user: userexist.user,name: userexist.name }    

    sign( payload, process.env.SECRETPRIVATEKEY, {
     expiresIn: '12h'
    }, (err, token) => {

      if ( err ) {
        console.log('Error_GeneteJWT',err);
      reject( 'No se pudo generar el token, inicia Sesión de nuevo')
      } else {
        resolve(token);
      }
    })
  })

}

export default generateJWT