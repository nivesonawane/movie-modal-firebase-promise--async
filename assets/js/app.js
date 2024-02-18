
const cl = console.log;

const addMovie = document.getElementById("addMovie");
const backdrop = document.getElementById("backdrop");
const movieModal = document.getElementById("movieModal");
const movieForm = document.getElementById("movieForm");
const movieTitleCtrl = document.getElementById("movieTitle");
const movieImgCtrl = document.getElementById("movieImg");
const movieRatingCtrl = document.getElementById("movieRating");
const exitBtnAll = [...document.querySelectorAll(".exitBtn")];
const movieContainer = document.getElementById("movieContainer");
const submitBtn = document.getElementById("submitBtn");
const updateBtn = document.getElementById("updateBtn");
const loader = document.getElementById("loader");

const baseUrl = `https://movie-modal-async-default-rtdb.asia-southeast1.firebasedatabase.app/`;
const movieUrl = `${baseUrl}/movies.json`;

const backdropHandler = () => {
   backdrop.classList.toggle("visible");
   movieModal.classList.toggle("visible");
}

exitBtnAll.forEach((btns) => {
   btns.addEventListener("click",backdropHandler);
})

const editMovie =async (ele) => {
   let editId = ele.closest(".card").id;
   localStorage.setItem("editId",editId);
   let editUrl = `${baseUrl}/movies/${editId}.json`;

   try{
      let res = await makeApiCall("GET",editUrl);
      movieTitleCtrl.value = res.movieTitle;
      movieImgCtrl.value = res.movieImg;
      movieRatingCtrl.value = res.movieRating;

      backdropHandler();
      updateBtn.classList.remove("d-none");
      submitBtn.classList.add("d-none");
   }
   catch(err){
      cl(err);
   }
   finally{
      loader.classList.add("d-none");
   }
 
}

const deleteMovie = (ele) => {
   Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
         let deleteId = ele.closest(".card").id;
         let deleteUrl = `${baseUrl}/movies/${deleteId}.json`;
         try{
            let res = await makeApiCall("DELETE",deleteUrl);
            document.getElementById(deleteId).remove();
         }
         catch(err){
            cl(err);
         }
         finally{
            loader.classList.add("d-none");
         }
        Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success"
        });
      }
    });
}

const displayMovies = (arr) => {
   movieContainer.innerHTML = arr.map((movie) => {
      return `<div class="card movieCard" id="${movie.id}">
                  <div class="card-header">
                     <h3 class="m-0 d-flex justify-content-between">
                         ${movie.movieTitle} 
                        <small>Rating: ${movie.movieRating}/5</small>
                     </h3>
                  </div> 
                  <div class="card-body">
                     <img src="${movie.movieImg}" alt="cardImg" title="cardImg">
                  </div>
                  <div class="card-footer d-flex justify-content-between">
                     <button class="btn btn-success" onclick="editMovie(this)">Edit</button>
                     <button class="btn btn-danger" onclick="deleteMovie(this)">Delete</button>
                  </div>
               </div>`
   }).join("");
}

const createMovie = (obj) => {
    let card = document.createElement("div");
    card.className = `card movieCard`;
    card.id = obj.id;
    card.innerHTML = `<div class="card-header">
                        <h3 class="m-0 d-flex justify-content-between">
                            ${obj.movieTitle}
                           <small>Rating: ${obj.movieRating}/5</small>
                        </h3>
                     </div> 
                     <div class="card-body">
                        <img src="${obj.movieImg}" alt="cardImg" title="cardImg">
                     </div>
                     <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-success" onclick="editMovie(this)">Edit</button>
                        <button class="btn btn-danger" onclick="deleteMovie(this)">Delete</button>
                     </div>`;
   movieContainer.prepend(card);
}

const makeApiCall = (methodName,apiUrl,msgBody=null) => {
   return new Promise((resolve,reject) => {
      loader.classList.remove("d-none");
      let xhr = new XMLHttpRequest();
      xhr.open(methodName,apiUrl);
      xhr.send(JSON.stringify(msgBody));

      xhr.onload = function(){
         if(xhr.status >= 200 && xhr.status < 300){
            resolve(JSON.parse(xhr.response));
         }
         else{
            reject("something went wrong");
         }
      }
   })
}

const fetchMovies = async () => {
      try{
         let data = await makeApiCall("GET",movieUrl);
         let movieArr = [];
         for(const key in data){
            let obj = {...data[key],id:key};
            movieArr.push(obj);
         }
         displayMovies(movieArr);
      }
      catch(err){
         cl(err);
      }
      finally{
         loader.classList.add("d-none");
      }
}

fetchMovies();

const submitMovie = async (eve) => {
   eve.preventDefault();
   let movieObj = {
      movieTitle: movieTitleCtrl.value,
      movieImg: movieImgCtrl.value,
      movieRating: movieRatingCtrl.value
   }
   try{
      let res = await makeApiCall("POST",movieUrl,movieObj);
      movieObj.id = res.name;
      createMovie(movieObj);
      backdropHandler();
      Swal.fire({
         title: `${movieObj.movieTitle} is added successfully`,
         icon: "success",
         timer: 3000
      })
   }catch(err){
      cl(err);
   }
   finally{
      loader.classList.add("d-none");
      movieForm.reset();
   }
}

const updateCard = (obj) => {
   let card = [...document.getElementById(obj.id).children];
   card[0].innerHTML = `<h3 class="m-0 d-flex justify-content-between">
                           ${obj.movieTitle}
                        <small>Rating: ${obj.movieRating}/5</small>
                        </h3>`
   card[1].innerHTML = `<img src="${obj.movieImg}" alt="cardImg" title="cardImg">`
}

const updateMovie = async () => {
   let updateId = localStorage.getItem("editId");
   let updateObj = {
      movieTitle: movieTitleCtrl.value,
      movieRating: movieRatingCtrl.value,
      movieImg: movieImgCtrl.value,
      id: updateId
   }
   let updateUrl = `${baseUrl}/movies/${updateId}.json`;
   try{
      let res = await makeApiCall("PATCH",updateUrl,updateObj);
      updateCard(updateObj);
      backdropHandler();
      Swal.fire({
         title: `${updateObj.movieTitle} movie updated successfully`,
         icon: "success",
         timer: 3000
      })
   }
   catch(err){
      cl(err);
   }
   finally{
      loader.classList.add("d-none");
      movieForm.reset();
      updateBtn.classList.add("d-none");
      submitBtn.classList.remove("d-none");
   }
}

addMovie.addEventListener("click",backdropHandler);
movieForm.addEventListener("submit",submitMovie);
updateBtn.addEventListener("click",updateMovie);

