import { request, response } from 'express';
import { verify } from 'jsonwebtoken';

import User from '../models/User.js';

const validateJWT = async (req = request, res = response, next) => {
   
  const token = req.headers['authorization'] ? req.headers['authorization'].replace('Bearer ', '') : null;
 
  if (!token ) {
    return res.status(401).json({
      msg: 'No hay token en la petición'
    });
  }

  try {
    const decoded = verify(token, process.env.SECRETPRIVATEKEY);
    
    // Agregar el objeto decodificado a la solicitud para que pueda ser utilizado por otros middleware
  

    //leer usuario que corresponde a id
    const user = await User.findByPk(decoded.id );
    req.user = user;
    // Imprimir el usuario obtenido en consola
    //verificar si el usuario existeen DB
    if ( !user ) {
      return res.status(401).json({
        msg: 'Token no valido - usuario no existe en db' 
      })
    }
    
    next();

  } catch (error) {
    //console.log(error);
   return res.status(401).json({
      msg: 'Token no válido'
    })
  }

  
}
 export default validateJWT

