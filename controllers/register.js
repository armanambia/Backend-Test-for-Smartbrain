const handleRegister = (req,res,db,bcrypt) =>{
    
    const {email, name, password} = req.body
    if(!email ||  !name || !password){
        return res.status(400).json('incorrect form submission')
    }
    const hash = bcrypt.hashSync(password)
    // bcrypt.hash(password, null, null, function(err, hash) {
    //     // Store hash in your password DB.
    // });
    console.log('inside register, before transaction')
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email,
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            console.log(loginEmail[0].email)
            return trx('users')
                .returning('*')
                .insert({
                email: loginEmail[0].email,
                name: name,
                joined: new Date()
            }).then(user => {
                res.json(user[0])
            })
            
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => {
        res.status(400).json('umable to register')
    })   
}



module.exports = {
    handleRegister: handleRegister
}