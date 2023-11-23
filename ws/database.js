const mongoose = require('mongoose');
const URI = ('mongodb+srv://alexandre:Dudinha41@cluster0.nswanj3.mongodb.net/plena-dep?retryWrites=true&w=majority');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose
    .connect(URI)
    .then(() => console.log('DB online!'))
    .catch(() => console.log(err));