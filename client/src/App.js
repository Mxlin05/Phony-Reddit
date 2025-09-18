// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import './stylesheets/App.css';
import { Banner, MainPage } from './components/mainPage.js';
import { useState,  } from "react";


//NOTES 
//JOINGIN G AND LEAVING COMMUNITY DOES NOT UPDATE THE MODEL CORRECTLY IN COMMUNITY PAGE VIEW PLS GO AND LOOK
//HOLY SHIET CODE IS GARBO MAYBE REBASE SOME OF IT IDK BRU

//THERE IS A BUG WHERE IF YOU MAKE A POST WITH NO LINKFLAIR, THEN GO TO THE EDIT MENU VIA PROFILE, AND JUST HIT SUBMIT
//WITHOUT CHANGING ANYTHING, IT READS THAT NO LINKFLAIR DOESN"T HAVE a value. I DON"T KNOW HOW TO FIX.
//ISSUE WHERE CREATE LINKFLAIR DURING EDITING POST DOESN"T WORK. IDK WHY. TOO TIRED RN.

///HANDLE BULLSHIT COMMUNITY DOES NOT EXIST BECAUSE OF SHIT CODE PLS GO BACKAKJSDNAKJDAKLJD IN CRAFTPOST


function App() {

  

  const [view, setView] = useState("welcome");
  const [userView, setUserView] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [searchQuerry, setSearchQuerry] = useState("");
  const [selectedCommunityID, setSelectedCommunityID] = useState(null);

  return (
    // <section className="phreddit">
    //   <Phreddit />
    // </section>
    <div>
      {/* <Banner />
      <LeftNavBar /> */}
      {<Banner view = {view} setView={setView} setSearchQuerry={setSearchQuerry} 
        setUserView={setUserView} userView={userView} admin={admin} setAdmin={setAdmin}/>}

      {<MainPage view = {view} searchQuerry={searchQuerry} setView={setView} 
       selectedCommunityID = {selectedCommunityID} setSelectedCommunityID = {setSelectedCommunityID} 
      userView={userView} setUserView={setUserView} admin={admin} setAdmin={setAdmin}/>}
    </div>

  );
}

export default App;
