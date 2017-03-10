var float = {
  
  /*************************************
  Attributs de notre objet  
  *************************************/
  x: 0,       //nombre floatant
  mBin: [],      // tableau pour la mantisse en binaire
  mReel: 0,      //mantisse reel
  mSize:23,   //nb de bit pour la mantisse
  eDecalage: 0,   //décalage
  eDecimal:0,   // exposant EMax
  eSize:0,    // taille de l'exposant
  eBin:0,   // exposant en binaire
  s: 0,       //signe de bits
  nbBits: 32,  //nmombre de bit sur lequel on encode l'information
 
  /*********************************************************************************
    Selon la norme IEEE 754-1985
    Voir tableau dans la sections Basic and interchange_formats
    source : https://en.wikipedia.org/wiki/IEEE_floating_point#Interchange_formats
  **********************************************************************************/ 
  IEEEFormatBits: [
    {bits: 16,  exponant: 5,  eMax: 15},
    {bits: 32,  exponant: 8,  eMax: 127},
    {bits: 64,  exponant: 11, eMax: 1023},
    {bits: 128, exponant: 15, eMax: 16383},
    {bits: 256, exponant: 19, eMax: 262143}
  ],
  
  /**********************************************************************************
   interchangeFormat() va nous permettre
   de vérifié si le nombre de bits existe déjà selon la norme IEEE 754-1985
   et de set la taille de l'exposant et son EMax
  **********************************************************************************/
  interchangeFormat : function(){
    for (var i = 0; i < this.IEEEFormatBits.length; i++) {
      if(this.IEEEFormatBits[i].bits == this.nbBits){
        this.eDecimal = this.eDecalage = this.IEEEFormatBits[i].eMax;
        this.eSize = this.IEEEFormatBits[i].exponant;
        console.log("EMAX :"+this.eDecimal);
        console.log("Exposant size :"+this.eSize);
        return 0;
      }
    }
    /*
    calcule de la taille de l'exposant selon selon la norme IEEE 754-1985.
    Ensuite enregistre la valeur de l'exposant Max et de sa taille dans le tableau
    pour éviter de le recalculer si l'utilisateur nous le demande
    */
    this.eSize = Math.round(4 * Math.log(this.nbBits) / Math.log(2) - 13);
    this.eDecimal = (Math.pow(2,this.eSize)/2)-1;
    this.IEEEFormatBits.push({bits: this.nbBits, exponant: this.eSize, eMax: this.eDecimal });
    return 0;
  },
  
  setNbits : function(nbBits){
    this.nbBits = Number(nbBits);
    this.interchangeFormat();
    this.mSize = this.nbBits - this.eSize - 1; // récupere la taille de la mantisse
  },  
  
  /********************************************************
  méthodes pour trouver le signe, mantisse et l'exposant
  permet de trouver le signe de bit
  *********************************************************/
  computeSigne : function(){
     if(this.x < 0){
       this.s=1;
       this.x *= -1;
     }else{
       this.s=0;
     }
  },
  
 /******************************************************
  va calculer l'exposant en décimal
 *******************************************************/
  computeExposant : function(){
    if(this.x < 1){
      while (this.x<1){
        this.x*=2; 
        this.eDecimal--;
        console.log("x < 1 donc e = "+ this.eDecimal +" et x = "+this.x)
      }
    }else if(this.x>=2){
      while(this.x>=2){
        this.x/=2;
        this.eDecimal++;
        console.log("x >= 2 donc e = "+ this.eDecimal +" et x = "+this.x)
      }
    }
    this.convertExposantToBin();
  },
  
  convertExposantToBin : function(){
    this.eBin = this.eDecimal.toString(2);
    console.log("exposant dec to bin (taille "+ this.eSize+") -> "+ this.eBin);
  },
  
 makeArrayMantisseEmpty : function(){
   if(this.mBin.length > 0){this.mBin = [];}
 },
  
 computeMantisse : function(){
    //on vérifie si le tableau m[] est vide ? 
    this.makeArrayMantisseEmpty(this.m);
    console.log("IN : computeMantisse");
    this.mReel = this.x;
    this.x--;
    console.log("x = "+this.x);
    console.log("Taille de la mantisse = "+this.mSize);
    for (var i = 0; i < this.mSize; i++) {
        console.log("----------------------------------------");
        console.log("x = "+ this.x);
        this.x *= 2;
        console.log(this.x+" * 2 = "+ this.x);
        if(this.x < 1){
          this.mBin.push(0);
          console.log("m["+i+"] ajout -> "+this.mBin[i]);
          console.log(this.mBin);
        }else{
          this.mBin.push(1);
          console.log("m["+i+"] ajout -> "+this.mBin[i]);
          console.log(this.mBin);
          this.x--;
        }
    }

  },
  
  casSpecialZero : function(){
    console.log("traiter le cas 0");
    this.makeArrayMantisseEmpty();
    this.eBin = 0;
    this.mReel = 0;
    this.mBin = Array(this.mSize).fill(0);    //rempli le tableau de 0
  },
  
  /*input*/
  decTo: function(x, nbBits){ //nombre de bits que l'on veut
    this.x = x;
    this.computeSigne();
    this.setNbits(nbBits);
    if(this.x == 0 || this.x == -0){
      this.casSpecialZero();
      return 1;
    }

    this.computeExposant();
    this.computeMantisse();
  },
  
  print: function(){
      $('binaire').value = this.s+this.eBin+this.mBin.join('');
      $('signe').value = (this.s == 1) ? 'négatif' : "positif";   
      $('mSize').value = this.mSize;
      $('mReel').value = this.mReel; 
      $('mBin').value = this.mBin.join('');
      $('eDec').value = this.eDecimal;
      $('eBin').value = this.eBin;
      $('nbBitsExponent').value = this.eSize;
      $('decalage').value = this.eDecalage;
  } 
};

/*
* fonction anonyme qui retourne l'élément qui porte l'id 
*/
var $ = function(id){
  return document.getElementById(id);
};

function decToBin(){
  var dec = $('decimal');
  var nbBits = $('nbBits');
  float.decTo(dec.value, nbBits.value);
  float.print();
}; 
