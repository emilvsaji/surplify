import { Link } from 'react-router-dom';
import {
  HiOutlineShoppingBag,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineGlobeAlt,
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
} from 'react-icons/hi';

const Home = () => {
  const features = [
    {
      icon: HiOutlineCurrencyDollar,
      title: 'Save Up to 70%',
      desc: 'Get quality restaurant food at a fraction of the original price.',
      color: 'primary',
    },
    {
      icon: HiOutlineClock,
      title: 'Convenient Pickup',
      desc: 'Choose your preferred time slot and pick up fresh, ready food.',
      color: 'accent',
    },
    {
      icon: HiOutlineGlobeAlt,
      title: 'Reduce Food Waste',
      desc: 'Every order helps prevent perfectly good food from being discarded.',
      color: 'green',
    },
  ];

  const steps = [
    { num: '01', title: 'Browse', desc: 'Explore surplus food from restaurants and cafes near you.' },
    { num: '02', title: 'Order', desc: 'Select your favorites, add to cart, and place your order.' },
    { num: '03', title: 'Pick Up', desc: 'Head to the shop at the scheduled time and enjoy great food.' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-full mb-8">
              <HiOutlineSparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">
                Fighting food waste, one meal at a time
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-gray-900 leading-tight">
              Save Food.{' '}
              <span className="text-gradient">Save Money.</span>
              <br />
              Save the Planet.
            </h1>

            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Surplify connects you with restaurants and hotels selling their surplus food at up to 70% off.
              Quality meals that would otherwise go to waste — now at prices everyone can afford.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/browse" className="btn-primary px-8 py-4 text-base gap-2 w-full sm:w-auto">
                Browse Food Nearby
                <HiOutlineArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/register" className="btn-secondary px-8 py-4 text-base w-full sm:w-auto">
                Join as Shop Owner
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div>
                <p className="text-2xl font-bold text-gray-900">500+</p>
                <p className="text-sm text-gray-500 mt-1">Meals Saved</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">50+</p>
                <p className="text-sm text-gray-500 mt-1">Partner Shops</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">70%</p>
                <p className="text-sm text-gray-500 mt-1">Avg. Savings</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold text-gray-900">
              Why Choose Surplify?
            </h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">
              A smarter way to eat well while making a real difference.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="card p-8 text-center hover:-translate-y-1">
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <f.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-3 text-gray-500">Three simple steps to start saving.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="card p-8">
                  <span className="text-4xl font-display font-bold text-primary-100">{step.num}</span>
                  <h3 className="text-lg font-semibold text-gray-900 mt-3 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <HiOutlineArrowRight className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for Shop Owners */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-10 lg:p-14 bg-gradient-to-br from-primary-600 to-primary-800 border-0 text-center">
            <h2 className="text-3xl font-display font-bold text-white mb-4">
              Own a Restaurant or Cafe?
            </h2>
            <p className="text-primary-100 max-w-lg mx-auto mb-8">
              Turn your surplus food into revenue instead of waste. Join hundreds of businesses already making a difference with Surplify.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors shadow-lg">
              Register Your Shop
              <HiOutlineArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
