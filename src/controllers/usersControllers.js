import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import User from "../models/User.js";
import  generateJWT  from '../helpers/generatejwt.js';
import { response } from 'express';
//import { generarJWT, generarId } from '../helpers/tokens.js'


 const getUsers = async (req, res) => {
  const desde = Number(req.query.desde) || 0;

  try {
    const users = await User.findAll({
      attributes: ['id','name','user','status','rol','warehouse'],
      offset: desde
    });

    const total = await User.count();

    res.json({
      ok: true,
      users,
      total
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener los usuarios'
    });
  }
};

 const getUser = async( req, res ) => {

  const { id } = req.params;

  const user = await User.findByPk( id );

  if( user ) {
      res.json(user);
  } else {
      res.status(404).json({
          msg: `No existe un usuario con el id ${ id }`
      });
  }


}

const createUser = async (req, res) => {

 try {
  //console.log(req.body);
 await check('name').notEmpty().withMessage('El Nombre no puede ir vacio').run(req)
 await check('user').notEmpty().withMessage('El usuario no puede ir vacio').run(req)
 await check('rol').notEmpty().withMessage('El usuario no puede ir vacio').run(req) 
 await check('warehouse').notEmpty().withMessage('El campo no puede ir vacio').run(req)
 await check('password').isLength({ min: 6 }).withMessage('El Password debe ser de al menos 6 caracteres').run(req)
 await check('repeat_password').equals(req.body.password).withMessage('Los Passwords no son iguales').run(req)

 const errors = validationResult(req);
 if (!errors.isEmpty()) {
   return res.status(400).json({ errors: errors.array() });
 }
 // Extraer los datos
  const { body } = req;

 // Verificar que el usuario no este duplicado
  const existUser = await User.findOne({ where: { user: body.user } });
 if(existUser) {
     return res.status(400).json({
      msg: 'El Usuario ' + body.user + ' ya existe, ingrese uno diferente'
  });
 }


 // Almacenar un usuario
 const user = new User({
    name: body.name.toUpperCase(), 
    user: body.user,
    password: body.password,    
    rol: body.rol,
    status: body.status,
    warehouse: body.warehouse
     //token: generarId()
 })
  // Encriptar contraseña
  const salt = await bcrypt.genSaltSync();
  user.password = bcrypt.hashSync(body.password, salt);
  
  
  await user.save();

  res.status(201).json({
    msg: 'Usuario guardado con exito',
    user
  })
  
 } catch (error) {
  //console.log(error);
  res.status(500).json({
    msg: 'Contacte al administrador'
})    
 }
  
}

const putUser = async( req, res) => {

  
  try {
    const { id }   = req.params;
    const { body } = req;
        
      const user = await User.findByPk( id );
      if ( !user ) {
          return res.status(404).json({
              msg: 'No existe un usuario con el id ' + id
          });
      }

      body.name = body.name.toUpperCase()

      await user.update( body );

    res.status(200).json({
      msg: 'Usuario Actualizado con exito',
      
    })


  } catch (error) {

      console.log(error);
      res.status(500).json({
          msg: 'Contacte al administrador'
      })    
  }   
}

const deleteUser = async( req, res) => {

  const { id } = req.params;

  const user = await User.findByPk( id );
  if ( !user ) {
      return res.status(404).json({
          msg: 'No existe un usuario con el id ' + id
      });
  }

  //await user.update({ estado: false });

  await user.destroy();

  res.status(200).json({
    msg: 'Usuario Borrado con exito',
    user
  })
}

const login = async (req, res) => {


  const { user, password } = req.body;
  try {

    // Verificar que los campos no vengan vacíos
    if (!user || !password) {
      return res.status(400).json({ message: 'Los campos son obligatorios.' });
    }

    // Buscar al usuario en la base de datos
    const userexist = await User.findOne({ where: { user } });
    if (!userexist) {
      return res.status(400).json({ message: 'El usuario es incorrecto' });
    }

    // Verificar que la contraseña sea correcta
    const validPass = bcrypt.compareSync(password, userexist.password);
    if (!validPass) {
      return res.status(400).json({
        message: 'Usuario / Password no son correctos'
      })
    }

    const token = await generateJWT(userexist);   

    res.json({ message: 'Inicio de sesión exitoso.', userexist,  token});
  } catch (error) {
    //console.error(error);
    res.status(500).json({ message: 'Error al iniciar sesión.' });
  }
};

const renewJWT = async (req, res = response) => { 

  const userexist = req.id;  
  //console.log(userexist);
  const token = await generateJWT(userexist);

  res.json({
   token });

}

const logout = async (req, res) => {
  try {

    //console.log(req.headers.authorization);
     // Invalida el token JWT en el servidor
    const token = req.headers.authorization.split(' ')[0];
  
    invalidTokens.push(token);

    
    // Elimina el token JWT del cliente
    res.clearCookie('x-token');
    
    // Envía una respuesta de éxito al cliente
    res.status(200).json({ message: 'Sesión cerrada correctamente.' });
  } catch (error) {
    // Si ocurre un error, envía una respuesta de error al cliente
    res.status(500).json({ message: 'Error al cerrar sesión.' });
  }
}

export {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  login,
  logout,
  putUser,
  renewJWT,
}