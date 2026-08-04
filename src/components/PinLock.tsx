import React, { useEffect, useState } from "react";
import { Lock, Delete } from "lucide-react";
import logo from "../assets/images/Kripin.png";

interface PinLockProps {
  onUnlock: () => void;
}

const STORAGE_PIN = "kripin_app_pin";

const PinLock: React.FC<PinLockProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState("");
  const [savedPin, setSavedPin] = useState("");

  const [firstTime, setFirstTime] = useState(false);
  const [confirmMode, setConfirmMode] = useState(false);

  const [firstPin, setFirstPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_PIN);

    if (stored) {
      setSavedPin(stored);
    } else {
      setFirstTime(true);
    }
  }, []);

  const verifyPin = (value: string) => {
    if (value === savedPin) {
      onUnlock();
      return;
    }

    setError("Incorrect PIN");

    setTimeout(() => {
      setPin("");
      setError("");
    }, 800);
  };

  const savePin = (value: string) => {
    localStorage.setItem(STORAGE_PIN, value);
    onUnlock();
  };

  const createPinFlow = (value: string) => {
    if (!confirmMode) {
      setFirstPin(value);
      setPin("");
      setConfirmMode(true);
      return;
    }

    if (value !== firstPin) {
      setError("PIN does not match");

      setTimeout(() => {
        setPin("");
        setFirstPin("");
        setConfirmMode(false);
        setError("");
      }, 1000);

      return;
    }

    savePin(value);
  };

  const pressNumber = (number: string) => {
    if (pin.length >= 4) return;

    const newPin = pin + number;

    setPin(newPin);
    setError("");

    if (newPin.length === 4) {
      setTimeout(() => {
        if (firstTime) {
          createPinFlow(newPin);
        } else {
          verifyPin(newPin);
        }
      }, 120);
    }
  };

  const removeDigit = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const keypad = [
    "1", "2", "3",
    "4", "5", "6",
    "7", "8", "9"
  ];

  return (

    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6 z-[9999]">

  <div className={`w-full max-w-sm bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl p-8 animate-[fadeIn_.35s_ease] ${ error ? "shake" : "" }`}>

    {/* Logo */}
    <div className="flex justify-center">
      <img
       src={logo}
       alt="Kripin"
       className="w-20 h-20 object-contain transition-transform duration-300 hover:scale-110"/>
    </div>

    {/* Heading */}
    <div className="text-center mt-5">

      <div className="flex items-center justify-center gap-2">

        <Lock className="w-6 h-6 text-emerald-500" />

        <h2 className="text-2xl font-bold text-white">
          {firstTime
            ? confirmMode
              ? "Confirm PIN"
              : "Create PIN"
            : "Secure Access"}
        </h2>

      </div>

      <p className="text-slate-400 text-sm mt-2">

        {firstTime
          ? confirmMode
            ? "Re-enter your PIN"
            : "Create your 4-digit PIN"
          : "Enter your 4-digit PIN"}

      </p>

    </div>

    {/* PIN Dots */}

    <div className="flex justify-center gap-4 my-8">

      {[0,1,2,3].map((i)=>(

        <div
          key={i}
          className={`w-4 h-4 rounded-full transition-all duration-300 ease-out ${
            i < pin.length
              ? "bg-emerald-500 scale-110 pop shadow-lg shadow-emerald-500/50"
              : "bg-slate-700"
          }`}
        />

      ))}

    </div>

    {error && (

      <p className="text-red-500 text-center text-sm mb-5">

        {error}

      </p>

    )}

    {/* Keypad */}

    <div className="grid grid-cols-3 gap-4">

      {keypad.map((item)=>(

        <button
          key={item}
          onClick={()=>pressNumber(item)}
          className="w-16 h-16 mx-auto rounded-full bg-slate-800 border border-slate-700
          hover:bg-emerald-500 hover:border-emerald-400
          hover:shadow-lg hover:shadow-emerald-500/30
          active:scale-90
          transition-all duration-200
          text-white text-2xl font-bold">
          {item}
        </button>

      ))}

      <div/>

      <button
        onClick={()=>pressNumber("0")}
        className="w-16 h-16 mx-auto rounded-full bg-slate-800 border border-slate-700 hover:bg-emerald-500 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-90 transition-all duration-200 text-white text-2xl font-bold">
        0
      </button>

      <button
        onClick={removeDigit}
        className="group w-16 h-16 mx-auto rounded-full bg-slate-800 border border-slate-700 hover:bg-red-500 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/30 active:scale-90 transition-all duration-200 text-white">
        <Delete className="w-7 h-7 mx-auto transition-transform duration-200 group-hover:scale-110" />
      </button>

    </div>

  </div>

</div>

  );
};

export const changePin = (
  oldPin: string,
  newPin: string
): { success: boolean; message: string } => {
  const savedPin = localStorage.getItem(STORAGE_PIN);

  if (savedPin !== oldPin) {
    return {
      success: false,
      message: "Current PIN is incorrect",
    };
  }

  if (newPin.length !== 4) {
    return {
      success: false,
      message: "New PIN must be 4 digits",
    };
  }

  localStorage.setItem(STORAGE_PIN, newPin);

  return {
    success: true,
    message: "PIN changed successfully",
  };
};

export default PinLock;