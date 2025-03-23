import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams
import './CardPage.css';

const CardPage = () => {
  const { username } = useParams();  // Get the username from the URL params
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCard = async () => {
      console.log('Fetching card for username:', username);

      try {
        const response = await fetch(`http://localhost:8080/api/cards/${username}`);

        if (!response.ok) {
          throw new Error('Card not found');
        }

        const data = await response.json();
        console.log('Fetched card data:', data);

        setCard(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching card:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCard();
  }, [username]);  // Dependency on username, to refetch when it changes

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="card-page">
      <h1>{card.display_name}</h1>
      <p>{card.bio}</p>
      <div>
        {card.social_medias && card.social_medias.map((social, index) => (
          <a key={index} href={social.link} target="_blank" rel="noopener noreferrer">
            <i className={`fa-brands ${social.icon}`}></i>
          </a>
        ))}
      </div>
      <div>
        {card.action_buttons && card.action_buttons.map((button, index) => (
          <a key={index} href={button.link} className="action-button">
            {button.text}
          </a>
        ))}
      </div>
      <img src={card.card_pic} alt="Card Profile" className="profile-pic" />
    </div>
  );
};

export default CardPage;
