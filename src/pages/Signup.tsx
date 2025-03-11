import { FormEvent, useRef } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useAuth } from "../context/AuthContext";

export function Signup() {
  const { signup } = useAuth();
  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (signup.isLoading) return;

    const email = emailRef.current?.value;
    const name = nameRef.current?.value;
    const photo = photoRef.current?.value;
    const password = passwordRef.current?.value;
    if (
      email == null ||
      email === "" ||
      name == null ||
      name === "" ||
      password == null ||
      password === ""
    ) {
      return;
    }

    signup.mutate({ email, name, photo, password });
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8 text-center">Sign Up</h1>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-5 items-center justify-items-end"
      >
        <label htmlFor="email">Email</label>
        <Input id="email" pattern="\S*" required ref={emailRef} />

        <label htmlFor="name">Name</label>
        <Input id="name" required ref={nameRef} />

        <label htmlFor="photo">Image Url</label>
        <Input id="photo" type="url" ref={photoRef} />
        <Button
          disabled={signup.isLoading}
          type="submit"
          className="col-span-full"
        >
          {signup.isLoading ? "Loading.." : "Sign Up"}
        </Button>
      </form>
    </>
  );
}
