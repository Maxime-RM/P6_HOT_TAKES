const Sauce = require('../models/Sauce')
const fs = require('fs');
const path = require('path');


exports.getAllSauces = (req, res, next) => {
  Sauce
    .find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(404).json({ error }))
}

exports.getOneSauce = (req, res, next) => {
  Sauce
    .findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
}

exports.createSauce = (req, res, next) => {  
  const sauceObject = JSON.parse(req.body.sauce)
  delete sauceObject._id;
  delete sauceObject._userId;

  // Vérification des champs obligatoires
  if (!sauceObject.name ||
      !sauceObject.manufacturer ||
      !sauceObject.description ||
      !sauceObject.mainPepper ||
      !sauceObject.heat ||
      !sauceObject.userId){        
        return res.status(400).json({ error: "Veuillez remplir tous les champs obligatoires" });
  }else{
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });
    sauce
      .save()
      .then(() => res.status(201).json({ message: "Sauce enregistrée" }))
      .catch((error) => res.status(400).json({ error }));
  }

  
};

exports.updateSauce = (req, res, next) => {
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete sauceObject._userId;

  // Vérification des champs obligatoires
  if (!sauceObject.name ||
    !sauceObject.manufacturer ||
    !sauceObject.description ||
    !sauceObject.mainPepper ||
    !sauceObject.heat ||
    !sauceObject.userId) {
    return res.status(400).json({ error: "Veuillez remplir tous les champs obligatoires" });
  } else {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        if (sauce.userId != req.auth.userId) {
          res.status(403).json({ message: 'Not authorized' });
        } else {
          // Vérifier si l'image a été modifiée
          if (sauce.imageUrl !== sauceObject.imageUrl) {
            // Supprimer l'ancienne image
            const filename = sauce.imageUrl.split('/images/')[1];
            const imagePath = path.join(__dirname, '..', 'images', filename);
            fs.unlink(imagePath, (error) => {
              if (error) {
                console.error('Erreur lors de la suppression de l\'image:', error);
              }
            });
          }

          Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
            .catch(error => res.status(401).json({ error }));
        }
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
  }
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (sauce.userId != req.auth.userId) {
        res.status(403).json({ message: 'Not authorized' });
      } else {
        const filename = sauce.imageUrl.split('/images/')[1];
        const imagePath = path.join(__dirname, '..', 'images', filename);
        fs.unlink(imagePath, (error) => {
          if (error) {
            console.error('Erreur lors de la suppression de l\'image:', error);
          }

          sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id})
      .then(sauce => {
          if (sauce.userId != req.auth.userId) {
              res.status(403).json({message: 'Not authorized'});
          } else {
              const filename = sauce.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  sauce.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};
exports.likeDislikeSauce = (req, res, next) => {
  let like = req.body.like
  let userId = req.body.userId
  let sauceId = req.params.id
  
  switch (like) {
    case 1 :
        Sauce.updateOne({ _id: sauceId }, { $push: { usersLiked: userId }, $inc: { likes: +1 }})
          .then(() => res.status(200).json({ message: `J'aime` }))
          .catch((error) => res.status(400).json({ error }))
            
      break;

    case 0 :
        Sauce.findOne({ _id: sauceId })
           .then((sauce) => {
            if (sauce.usersLiked.includes(userId)) { 
              Sauce.updateOne({ _id: sauceId }, { $pull: { usersLiked: userId }, $inc: { likes: -1 }})
                .then(() => res.status(200).json({ message: `Neutre` }))
                .catch((error) => res.status(400).json({ error }))
            }
            if (sauce.usersDisliked.includes(userId)) { 
              Sauce.updateOne({ _id: sauceId }, { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 }})
                .then(() => res.status(200).json({ message: `Neutre` }))
                .catch((error) => res.status(400).json({ error }))
            }
          })
          .catch((error) => res.status(404).json({ error }))
      break;

    case -1 :
        Sauce.updateOne({ _id: sauceId }, { $push: { usersDisliked: userId }, $inc: { dislikes: +1 }})
          .then(() => { res.status(200).json({ message: `Je n'aime pas` }) })
          .catch((error) => res.status(400).json({ error }))
      break;
      
      default:
        console.log(error);
  }
}